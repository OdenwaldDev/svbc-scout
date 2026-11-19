import { draftProblems, evaluate, today, validateCase } from "./domain.mjs?v=beta-0.99.102";
import { projectPdf } from "./documents.mjs?v=beta-0.99.102";
import { eml, encodeBytes } from "./eml.mjs?v=beta-0.99.102";

function download(content, type, filename) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function pdfHash(pdf) {
  const digest = await crypto.subtle.digest("SHA-256",pdf);
  return Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,"0")).join("");
}
export function createSportApi(context) {
  const { sb, club } = context;
  let outlook = { configured:false, address:null };
  let crest;
  const makePdf = async (item,facts,day) => {
    crest ??= fetch(new URL("../logo.png",import.meta.url)).then(async response => {
      if (!response.ok) throw new Error("Das Vereinswappen konnte für die Projektskizze nicht geladen werden.");
      return new Uint8Array(await response.arrayBuffer());
    }).catch(error => {
      crest = null;
      throw error;
    });
    return new Uint8Array(projectPdf(window.jspdf.jsPDF,item,facts,club,day,await crest));
  };
  const mail = async (action, payload={}) => {
    const result=await sb.functions.invoke("foerder-outlook",{body:{action,...payload}});
    if (result.error) {
      const details=await result.error.context?.json?.().catch(()=>null);
      throw new Error(details?.error || "Outlook-Entwurfsdienst ist nicht verfügbar.");
    }
    return result.data;
  };
  const rpc = async (action, id = null, data = null) => {
    const result = await sb.rpc("foerder_akte", { aktion: action, fall: id, eingabe: data });
    if (result.error) throw new Error(result.error.message);
    return result.data;
  };
  return async (path, method = "GET", data) => {
    const day = today();
    if (path === "state") {
      const [stand,connection,session]=await Promise.all([
        rpc("stand"),mail("status").catch(()=>({configured:false,address:null})),sb.auth.getSession(),
      ]);
      outlook=connection;
      return { ...stand, club, day, mode:"Sportzentrale", outlook, ai:false, peopleAvailable:typeof context.openPeople==="function", meetingAccount:session.data?.session?.user?.id };
    }
    if (path === "people") { if(typeof context.openPeople!=="function")throw new Error("Einladungen verwaltet der Admin der Sportzentrale.");return context.openPeople(); }
    if (path === "outlook/connect") return mail("connect");
    if (path === "outlook/disconnect") return outlook=await mail("disconnect");
    if (path === "facts") return (await rpc("dossier",null,data)).facts;
    if (path === "import") {
      for (const project of data.cases) validateCase(project);
      return rpc("importieren",null,data);
    }
    if (path === "cases") return rpc("speichern",null,validateCase(data));
    const [,id,action] = path.split("/");
    if (method === "PUT") return rpc("speichern",id,validateCase(data));
    const account=outlook.account || null;
    const { item, facts, factsVersion, approval, events, outlookUnresolved } = await rpc("lesen",id,{account});
    const review = item.version + ":" + factsVersion + ":" + day + (account ? ":"+account : "");
    const validApproval = approval?.review === review ? approval : null;
    const problems = draftProblems(item,facts,day);
    if (!action) {
      let currentHash = null;
      let documentWarning = "";
      if (validApproval && !problems.length) {
        try { currentHash = await pdfHash(await makePdf(item,facts,day)); }
        catch { documentWarning = "Der PDF-Anhang konnte nicht geprüft werden. Du kannst die Akte bearbeiten. Lade sie erneut, bevor du den Entwurf freigibst oder exportierst."; }
      }
      return { item, report:evaluate(item,facts,day), review,
        approval:currentHash && currentHash === validApproval?.pdfHash ? validApproval : null, events, problems, outlookUnresolved, documentWarning };
    }
    const pdf = await makePdf(item,facts,day);
    if (action === "approve") {
      if (problems.length || data.review !== review || data.confirmed !== true) throw new Error("Bitte die aktuelle Fassung prüfen und bestätigen.");
      return rpc("freigeben",id,{review, account, pdfHash:await pdfHash(pdf), confirmed:true});
    }
    if (action === "pdf") return download(pdf,"application/pdf","Projektskizze.pdf");
    if (action === "eml" && validApproval && !problems.length) {
      await rpc("eml",id,{review,account,pdfHash:await pdfHash(pdf)});
      return download(eml({to:item.contact.email,subject:item.draft.subject,body:item.draft.body},pdf),"message/rfc822","SVBSC-Entwurf.eml");
    }
    if (action==="outlook" && account && validApproval?.status==="approved" && !problems.length && !outlookUnresolved) {
      return mail("draft",{caseId:id,account,review,pdf:encodeBytes(pdf)});
    }
    throw new Error("Die Aktion benötigt eine aktuelle Freigabe.");
  };
}
let context;
if (location.pathname.startsWith("/foerderzentrale/")) {
  try { context = window.parent.svFoerderKontext?.(); } catch { /* Fremdeinbettung erhält keinen Zugriff. */ }
}
export const embeddedApi = location.pathname.startsWith("/foerderzentrale/") ? context ? createSportApi(context)
  : async () => { throw new Error("Bitte die Förderzentrale aus der angemeldeten Sportzentrale öffnen."); } : null;
export const outlookOutcome = context?.outcome;
