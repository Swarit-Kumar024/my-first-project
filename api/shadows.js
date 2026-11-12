const { config, notion, send, errorResponse, propValue } = require("./_notion");
module.exports = async function handler(req,res) {
  if(req.method!=="GET"){res.setHeader("Allow","GET");return send(res,405,{error:"Method not allowed."});}
  try {
    const {token}=config();
    const id=process.env.NOTION_SHADOWS_DATA_SOURCE_ID||"6cf1ea27-6f99-47e8-a9e3-a25d648486d0";
    const data=await notion("/data_sources/"+id+"/query",{method:"POST",body:JSON.stringify({page_size:100})});
    const shadows=(data.results||[]).map(page=>{const p=page.properties||{};return {
      id:page.id,name:propValue(p.Shadow),specialisation:propValue(p.Specialisation)||"",
      rank:propValue(p.Rank)||"E",level:propValue(p.Level)||1,ability:propValue(p.Ability)||"",
      xp:propValue(p["Shadow XP"])||0
    };});
    return send(res,200,{shadows});
  } catch(error){return errorResponse(res,error);}
};