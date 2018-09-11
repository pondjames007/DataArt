let border = -1;
let allData;
let regBorder = [];
let country = [];
let population = [];
let color = [];
let isLoaded = false;
let number = 1;

regBorder.push(0);
window.onload = init;

function init(){
	

	$.getJSON("simpleData_noRegions.json", (allData)=> {
		console.log(allData);
	
		for(data of allData){
			if(data["country"].match(/other/gi) != null){
				let region = data["country"].replace("Other ", "");
				// console.log(region);
				let newBorder = allData.indexOf(data);
				// console.log(newBorder);
				for(let i = border+1; i <= newBorder; i++){
					allData[i]["region"] = region;
				}
				border = newBorder;
				regBorder.push(newBorder+1);
			}
			country.push(data["country"]);
			population.push(data["estimate"]);
			let r = Math.round(Math.random()*255);
			let g = Math.round(Math.random()*255);
			let b = Math.round(Math.random()*255);
			let colorStr = 'rgba('+r+','+g+','+b+',0.8)';
			color.push(colorStr);	
		}
		// console.log(country.slice(0, 8));
		isLoaded = true;
		// console.log(country)
		// console.log(population)
	});

	
}

window.addEventListener("click", ()=>{
	if(isLoaded == true){
		if(document.body.querySelector("canvas")){
			document.body.removeChild(document.body.querySelector("canvas"));
		}
		// console.log(regBorder[0])

		let canvas = document.createElement("canvas");
		canvas.setAttribute("id", "barGraph");
		canvas.setAttribute("width", window.innerWidth);
		canvas.setAttribute("height", window.innerHeight);
		document.body.appendChild(canvas);

		bargraph(country, population, color, regBorder, number);
		number++;
		if(number >= regBorder.length){
			number = 1;
		}
	}
});


function bargraph(country, population, color, regBorder, number){
	let canvas = document.getElementById("barGraph").getContext('2d');
	console.log(color.slice(regBorder[number-1], regBorder[number]))
	let chart = new Chart(canvas, {
		type: 'bar', 
		data: {
			labels: country.slice(regBorder[number-1], regBorder[number]),
			datasets: [{
				label: country[regBorder[number]-1].replace("Other", ""),
				data: population.slice(regBorder[number-1], regBorder[number]),
				backgroundColor: color.slice(regBorder[number-1], regBorder[number]),
				borderColor: Chart.defaults.global.defaultColor,
				borderWidth: 1
			}]
		},
		options: {
			responsive: true,
			legend: {
				position: 'top',
			},
			title: {
				display: true,
				text: '# of Immigrations to U.S.A.'
			},
			animation: {
				animateScale: true,
				animateRotate: true
			}
		}
	});

	console.log(chart)
}

// function mouseReleased(){
// 	number++;
// 	if(number >= regBorder.length){
// 		number = 1;
// 	}
// 	let iframes = document.querySelector('iframe');
	
// 	// iframes.remove();
// 	clear();
// 	loop();
// }