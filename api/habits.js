const { config, notion, send, errorResponse, propValue } = require("./_notion");
function mapHabit(page) { const p=page.properties||{}; return { id:page.id, title:propValue(p.Habit), active:!!propValue(p.Active), frequency:propValue(p.Frequency)||"Daily", target:propValue(p.Target)||1 }; }
module.exports = async function handler(req,res) {
  try {
    const c=config();
    if(req.method==="GET") {
      const data=await notion("/data_sources/"+c.habits+"/query",{method:"POST",body:JSON.stringify({page_size:100,filter:{property:"Active",checkbox:{equals:true}}})});
      return send(res,200,{habits:(data.results||[]).map(mapHabit)});
    }
    if(req.method==="POST") {
      const {title,frequency="Daily",target=1}=req.body||{};
      if(typeof title!=="string"||!title.trim()) return send(res,400,{error:"Habit name is required."});
      if(!["Daily","Weekly"].includes(frequency)) return send(res,400,{error:"Invalid frequency."});
      const page=await notion("/pages",{method:"POST",body:JSON.stringify({parent:{type:"data_source_id",data_source_id:c.habits},properties:{
        Habit:{title:[{text:{content:title.trim().slice(0,200)}}]},Active:{checkbox:true},Frequency:{select:{name:frequency}},Target:{number:Math.max(1,Math.min(100,Number(target)||1))}
      }})});
      return send(res,201,{habit:mapHabit(page)});
    }
    res.setHeader("Allow","GET, POST"); return send(res,405,{error:"Method not allowed."});
  } catch(error){return errorResponse(res,error);}
};