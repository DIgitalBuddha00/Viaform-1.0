export const appearanceThemes=[
 {id:"preparation",name:"Preparation",descriptor:"Calm · Focused · Organised",description:"Cool slate and soft blue-grey. Plan with purpose.",swatches:["#f7f7f4","#e9ece8","#45655e","#9fb5ae","#263632"]},
 {id:"determination",name:"Determination",descriptor:"Strong · Driven · Confident",description:"Plum and magenta with deeper contrast and purposeful energy.",swatches:["#fbf7fa","#f1e7ee","#8d3e68","#c77da1","#412536"]},
 {id:"focus",name:"Focus",descriptor:"Clear · Present · Purposeful",description:"Cool blue and navy. Precise, restrained and present.",swatches:["#f6f8fb","#e7edf4","#345b7e","#82a6c3","#233747"]},
 {id:"growth",name:"Growth",descriptor:"Development · Possibility · Forward",description:"Sage and green grounded in real gymnastics development.",swatches:["#f7f8f4","#e8ede2","#607b55","#a9ba9d","#34402f"]},
 {id:"connection",name:"Connection",descriptor:"People · Support · Belonging",description:"Teal and aqua with a warmer, human team atmosphere.",swatches:["#f5f9f8","#e2efec","#36786f","#8bbdb5","#29443f"]},
 {id:"reflection",name:"Reflection",descriptor:"Insight · Perspective · Balance",description:"Warm earth and amber for quieter review and perspective.",swatches:["#faf7f2","#f0e8dc","#8a633e","#c4a274","#49382b"]},
] as const;
export type AppearanceTheme=(typeof appearanceThemes)[number]["id"];
export const appearanceThemeIds=appearanceThemes.map(x=>x.id) as AppearanceTheme[];
export function isAppearanceTheme(x:unknown):x is AppearanceTheme{return typeof x==="string"&&appearanceThemeIds.includes(x as AppearanceTheme)}
export function resolveAppearanceTheme(x:unknown):AppearanceTheme{return isAppearanceTheme(x)?x:"preparation"}
