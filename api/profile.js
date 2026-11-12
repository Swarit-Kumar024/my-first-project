const { config, notion, send, errorResponse, propValue } = require("./_notion");
module.exports = async function handler(req,res) {
  if(req.method!=="GET"){res.setHeader("Allow","GET");return send(res,405,{error:"Method not allowed."});}
  try {
    const {profile}=config();
    const page=await notion("/pages/"+encodeURIComponent(profile));
    const p=page.properties||{};
    return send(res,200,{profile:{
      name:propValue(p.Player)||"PLAYER", totalXp:propValue(p["Total XP"])||0, gold:propValue(p["Total Gold"])||0,
      level:propValue(p.Level)||1, xpIntoLevel:propValue(p["XP Into Level"])||0, xpRemaining:propValue(p["XP Remaining"])||1000,
      rank:propValue(p["Hunter Rank"])||"E-Rank", cleared:propValue(p["Quests Cleared"])||0,
      questCount:propValue(p["Quest Count"])||0, completionRate:propValue(p["Completion Rate"])||0
    }});
  } catch(error){return errorResponse(res,error);}
};