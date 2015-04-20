
function PieDataToZero(){
    var data = [
          {'device':'tablet', 'qte':0},
          {'device':'mobile', 'qte':0},
          {'device':'desktop', 'qte':0}

        ]
  return data;
}

function trendLine(days){
    if (trendFlag === true){
        trendFlag = false;
        lineChart.render();
    }else{
        trendFlag = true;

        var temp = getLinechartDataPoints(days-1);
        var t = getLinechartDataPoints(days-1).map(function(d){
            return d.y;
        });

        trendLineToBeDrawn = movingWindowAvg(t, 7).map(function(d, i){
            return {y:d, x:temp[i].x};
        })

        lineChart.render();
    }

}

var movingWindowAvg = function (arr, step) {
    return arr.map(function (_, idx) {
        var wnd = arr.slice(idx - step, idx + step + 1);
        var result = d3.sum(wnd) / wnd.length;
        result = (result == result) ? result : _;

        return result;
    });
};


function meanLine(days){
    if (meanFlag === true){
        meanFlag = false;
        lineChart.render();
    }else{
        meanFlag = true;
        meanLineToBeDrawn = [];
        var meanLineData = getLinechartDataPoints(days-1).map(function(element){
                return [ element.x.valueOf(), element.y];
        });
        var meanLine = regression('linear', meanLineData);
        meanLineData.forEach(function(element){
            meanLineToBeDrawn.push({y: meanLine.equation[0]*element[0] + meanLine.equation[1],
                                    x:new Date(element[0])
                                  });
        })
        lineChart.render();
    }
}



function getPastDays(days){
    trendFlag = false;
    meanFlag = false;
    daysRange = days;

    updateGenderCount(days);
    //line chart
    lineChart.setSeries(getLinechartDataPoints(days-1));
    lineChart.update(days);

    //pie chart

    chart.data(PieSortData(days));
    chart.render();
}


function PieSortData(days){
  var result = PieDataToZero();
  var pastDaysData = [];
  var today = new Date(2014, 06, 31);
  var dateLimit = new Date (2014, 06, 31-days)

  rawData.forEach(function(e){
    var month = e.Date[0] -1,
        day = e.Date.substr(2,2),
        year = e.Date.substr(5,4);

    var ThisEntryDate = new Date (year, month, day)
     if ( ThisEntryDate >= dateLimit ){
        result.forEach(function(p){
          if(p.device === e.Device){
            p.qte++
          }
      })
     }

  })
  return result;

}

function getGender(days){
    var today = new Date(2014, 06, 31);
    var dateLimit = new Date (2014, 06, 31-days)
    menCount = 0;
    womenCount = 0;
    rawData.forEach(function(e){
        var month = e.Date[0] -1,
            day = e.Date.substr(2,2),
            year = e.Date.substr(5,4);

            var ThisEntryDate = new Date (year, month, day);
            if ( ThisEntryDate >= dateLimit ){
                if ( e.Gender === 'male'){
                    menCount++
                }else{
                    womenCount++
                }
            }
    })
}

function updateGenderCount(days){
    getGender(days);
    document.getElementById("menCount").innerHTML = menCount;
    document.getElementById("womenCount").innerHTML = womenCount;
    document.getElementById("totalCount").innerHTML = womenCount+menCount;

}


function getLinechartDataPoints(days){
    var result = [];
    var count = 0;
    var rows = 0;
    var today = new Date(2014,7,1);
    var dateLowerLimit = new Date(2014, 6, 31-days);
    rawData.forEach(function(d, i){

        if (dateLowerLimit < new Date(d.Date+' '+d.Time) && new Date(d.Date+' '+d.Time) < today){
            rows++;
            if ( d.Activity === '1'){
                count++;
            }
            var format = d3.time.format("%Y-%m-%d-%H-%S");
            var date = new Date(d.Date+' '+d.Time);
            var ddd = format(date);

            var percent = count/rows;
            result.push( {x : date, y: percent} );

        }
    });
    result.sort(function(obj1, obj2) {
        return obj1.x - obj2.x;
    });
    return result;
}

