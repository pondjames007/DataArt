let border = -1;
let allData;

let dataArray = [];
dataArray.push(['Location', 'Parent', 'Estimate # of People', 'Margin of Error']);
dataArray.push(['Global', null, 0, 0]);




google.charts.load('current', {'packages':['treemap']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
	$.getJSON("simpleData_noRegions.json", (allData)=> {
		// console.log(allData);

		for(data of allData){
			if(data["country"].match(/other/gi) != null){
				let region = data["country"].replace("Other ", "");
				// console.log(region);
				let newBorder = allData.indexOf(data);
				// console.log(newBorder);
				for(let i = border+1; i <= newBorder; i++){
					allData[i]["region"] = region;
					dataArray.push([allData[i]["country"], allData[i]["region"], parseInt(allData[i]["estimate"]), parseInt(allData[i]["marginOfError"])]);
				}
				border = newBorder;
				
				dataArray.push([region, "Global", 0, 0]);
			}
			
		}

		console.log(dataArray);
		let drawData = google.visualization.arrayToDataTable(dataArray);

		tree = new  google.visualization.TreeMap(document.getElementById('chart_div'));

		let options = {
			title: "# of Immigrations to U.S.A.",
			titleTextStyle:{fontSize: 20},
			highlightOnMouseOver: true,
			maxDepth: 1,
			maxPostDepth: 2,
			minHighlightColor: '#8c6bb1',
			midHighlightColor: '#9ebcda',
			maxHighlightColor: '#edf8fb',
			minColor: '#d994f3',
			midColor: '#738bef',
			maxColor: '#764fc6',
			headerHeight: 15,
			showScale: true,
			height: 500,
			useWeightedAverageForAggregation: true,
			generateTooltip: (row, size) => {
				
				if(drawData.getValue(row, 1) == "Global"){
					return '<div style="background:#fd9; padding:10px; border-style:solid">' +
					'<span style="font-family:Courier"><b>' + drawData.getValue(row, 0) +
					'</b>, ' + drawData.getValue(row, 1) + '</span><br>' +
					drawData.getColumnLabel(2) + ": " + size + ' </div>';
				}
				else{
					return '<div style="background:#fd9; padding:10px; border-style:solid">' +
					'<span style="font-family:Courier"><b>' + drawData.getValue(row, 0) +
					'</b>, ' + drawData.getValue(row, 1) + '</span><br>' +
					drawData.getColumnLabel(2) + ": " + size + '<br>' +
					drawData.getColumnLabel(3) + ': ' + drawData.getValue(row, 3) + ' </div>';
				}
				
				}
		  };

		tree.draw(drawData, options);
	});
	

  }



