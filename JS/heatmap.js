d3.csv('https://raw.githubusercontent.com/plotly/datasets/master/api_docs/mt_bruno_elevation.csv', function(err, rows){
function unpack(rows, key) {
  return rows.map(function(row) { return row[key]; });
}

var z_data=[ ]
for(i=0;i<24;i++)
{
  z_data.push(unpack(rows,i));
}

var data = [{
           z: z_data,
           type: 'surface'
        }];

var layout = {
  title: 'Test Plot',
  autosize: false,
  width: 800,
  height: 800,
  margin: {
    l: 90,
    r: 90,
    b: 90,
    t: 90,
  }
};
Plotly.newPlot('heatmap', data, layout);
});
