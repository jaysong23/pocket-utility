export const units={
 '길이':[['m','미터',1],['mm','밀리미터',.001],['cm','센티미터',.01],['km','킬로미터',1000],['in','인치',.0254],['ft','피트',.3048],['yd','야드',.9144],['mi','마일',1609.344]],
 '무게':[['kg','킬로그램',1],['g','그램',.001],['mg','밀리그램',.000001],['t','톤',1000],['lb','파운드',.45359237],['oz','온스',.028349523125]],
 '압력':[['Pa','파스칼',1],['kPa','킬로파스칼',1000],['MPa','메가파스칼',1e6],['bar','바',1e5],['hPa','헥토파스칼',100],['atm','표준기압',101325],['psi','PSI',6894.757293168],['Torr','토르',101325/760]],
 '면적':[['m²','제곱미터',1],['cm²','제곱센티미터',.0001],['km²','제곱킬로미터',1e6],['ha','헥타르',1e4],['평','평',400/121],['ft²','제곱피트',.09290304],['acre','에이커',4046.8564224]],
 '부피':[['L','리터',1],['mL','밀리리터',.001],['m³','세제곱미터',1000],['cm³','세제곱센티미터',.001],['US gal','미국 갤런',3.785411784],['UK gal','영국 갤런',4.54609],['US fl oz','미국 액량 온스',.0295735295625]],
 '온도':[['°C','섭씨',1],['°F','화씨',1],['K','켈빈',1]],
 '속도':[['m/s','미터/초',1],['km/h','킬로미터/시',1/3.6],['mph','마일/시',.44704],['kn','노트',1852/3600],['ft/s','피트/초',.3048]],
 '데이터':[['B','바이트',1],['bit','비트',.125],['KB','킬로바이트 · 1000',1000],['MB','메가바이트 · 1000²',1e6],['GB','기가바이트 · 1000³',1e9],['TB','테라바이트 · 1000⁴',1e12],['KiB','키비바이트 · 1024',1024],['MiB','메비바이트 · 1024²',1048576],['GiB','기비바이트 · 1024³',1073741824]],
 '시간':[['s','초',1],['min','분',60],['h','시간',3600],['day','일',86400],['week','주',604800]]
};
export function convertUnit(value,category,from,to){if(!Number.isFinite(value))throw Error('유효한 숫자를 입력해 주세요.');const list=units[category];const a=list?.find(u=>u[0]===from),b=list?.find(u=>u[0]===to);if(!a||!b)throw Error('단위를 확인해 주세요.');if(category==='온도'){const c=from==='°C'?value:from==='°F'?(value-32)*5/9:value-273.15;if(c < -273.15-1e-10)throw Error('절대영도보다 낮은 온도는 입력할 수 없습니다.');return to==='°C'?c:to==='°F'?c*9/5+32:c+273.15}return value*a[2]/b[2]}
export function parseAmount(text){if(!text.trim())return null;const clean=text.trim();if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(clean))throw Error('쉼표 없이 숫자를 입력해 주세요.');const value=Number(clean);if(!Number.isFinite(value))throw Error('숫자가 너무 큽니다.');return value}
export const formatValue=value=>Number.isFinite(value)?new Intl.NumberFormat('ko-KR',{maximumSignificantDigits:12}).format(Object.is(value,-0)?0:value):'계산 범위를 초과했습니다.';
export function exchange(value,from,to,rates){if(!Number.isFinite(value)||!Number.isFinite(rates[from])||!Number.isFinite(rates[to])||rates[from]<=0||rates[to]<=0)throw Error('환율 정보를 확인해 주세요.');return value/rates[from]*rates[to]}
