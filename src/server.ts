import express = require('express')
import { MetricsHandler, Metric } from './metrics'
import { UsersHandler, User } from './users'
import path = require('path')
import bodyparser = require('body-parser')
import { userInfo } from 'os'

var session = require('express-session')
const app = express()
const port: string = process.env.PORT || '8080'

app.use(express.static(path.join(__dirname, '/../public')))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded())
app.use(express.urlencoded())

app.use(session({
  'secret': 'MySecretsession'
}))

app.set('views', __dirname + "/../views")
app.set('view engine', 'ejs');

const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')
const dbUs: UsersHandler = new UsersHandler('./db/users')

app.get('/', (req: any, res: any) => {
  res.render('menu.ejs', {
  user: req.user })
  res.end()
})

app.get('/connexion', (req: any, res: any) => {
  res.render('connexion.ejs')
  res.end()
})

app.get('/inscription', (req: any, res: any) => {
  res.render('inscription.ejs')
  res.end()
})

app.get('/graph', (req: any, res: any) => {
  res.render('graph.ejs')
  res.end()
})

app.get('/hello/:name', (req: any, res: any) => {
  res.render('hello.ejs', {name: req.params.name})
})

app.get('/metrics/:id', (req: any, res: any) => {
  dbMet.get(req.params.id, (err: Error | null, result?: any) => {
    if (err) throw err
    res.json(result)
  })
})

app.post('/metrics/:id', (req: any, res: any) => {
  dbMet.save(req.params.id, req.body, (err: Error | null) => {
    if (err) throw err
    res.status(200).send()
  })
})

app.get('/users/:id', (req: any, res: any) => {
  dbUs.get(req.params.id, (err: Error | null, result?: any) => {
    if (err) throw err
    res.json(result)
  })
})

app.get('/delete-metric/:key', (req: any, res: any) => {
  dbMet.del(req.params.key, (err: Error | null, result?: any) => {
    if (err) throw err
    res.json(result)
  })
})

app.post('/delete-metric/:key', (req: any, res: any) => {
  res.status(200).send()
})

/*app.get('/insert-metric', (req: any, res: any) => {
  dbMet.add('Pierre-Louis', req.body.key, req.body.value, (err: Error | null, result?: any) => {
    if (err) throw err
    console.log("Ici")
    res.json(result)
  })
})*/

app.post('/insert-metric', (req: any, res: any) => {
    res.status(200).send()
})

app.post('/register', (req: any, res: any) => {
  const user = new User(req.body.name, req.body.mail, req.body.pwd)
  dbUs.save(user, (err: Error | null) => {
    console.log(user)
    if (err) throw err
    res.status(200).send()
    res.redirect("/connexion")

  })
})

app.post('/login', (req: any, res: any) => {
  dbUs.get(req.body.name, (err: Error | null, result?: User) => {
    if (err) { 
    res.redirect('/connexion')
    }
    else if (result === undefined)
    {
      delete req.session.loggedIn
      delete req.session.user
      res.redirect('/connexion')
    }
    else {
      req.session.loggedIn = true;
      req.session.user = result;
      res.redirect('/home')
    }
  })
})


app.get('/home', (req: any, res: any) => {
  if (req.session.loggedIn == true)
  res.render('home.ejs')
  else res.redirect('/connexion')
  res.end()
})

app.get('/logout', (req: any, res: any) => {
  delete req.session.loggedIn
  delete req.session.user
  res.redirect("/connexion")
})

app.get('/user', (req: any, res: any) => {
  res.render('user.ejs', {user: req.session.user})
  console.log(req.session.user)
})

app.post('/update', (req: any, res: any, next: any )=> {
  var user = req.session.user
  dbUs.get(user.name, (err, user: any) => {
    if (err) return next(err);
    user.mail = req.body.mail;
    dbUs.save(user, (err) => {
      if (err) return next(err);
      res.redirect("/user");
    });
  });
  
});

app.listen(port, (err: Error) => {
  if (err) throw err
  console.log(`Server is running on http://localhost:${port}`)
})

// 15:72:876000000
// 2019-11-04 14:00 UTC

/* GOOGLE CHART: MARCHE
<!DOCTYPE html>
<html lang="en">
  <head>
      <% include partials/head %>
      <script type = "text/javascript" src = "https://www.gstatic.com/charts/loader.js">
      </script>
      <script type = "text/javascript">
         google.charts.load('current', {packages: ['corechart','line']});  
      </script>
  </head>
  <body>
    <div id = "container" style = "width: 550px; height: 400px; margin: 0 auto">
    </div>
    <script language = "JavaScript">
       function drawChart() {
          // Define the chart to be drawn.
          var data = new google.visualization.DataTable();
          data.addColumn('string', 'Month');
          data.addColumn('number', 'Tokyo');
          data.addColumn('number', 'New York');
          data.addColumn('number', 'Berlin');
          data.addColumn('number', 'London');
          data.addRows([
             ['Jan',  7.0, -0.2, -0.9, 3.9],
             ['Feb',  6.9, 0.8, 0.6, 4.2],
             ['Mar',  9.5,  5.7, 3.5, 5.7],
             ['Apr',  14.5, 11.3, 8.4, 8.5],
             ['May',  18.2, 17.0, 13.5, 11.9],
             ['Jun',  21.5, 22.0, 17.0, 15.2],
             
             ['Jul',  25.2, 24.8, 18.6, 17.0],
             ['Aug',  26.5, 24.1, 17.9, 16.6],
             ['Sep',  23.3, 20.1, 14.3, 14.2],
             ['Oct',  18.3, 14.1, 9.0, 10.3],
             ['Nov',  13.9,  8.6, 3.9, 6.6],
             ['Dec',  9.6,  2.5,  1.0, 4.8]
          ]);
             
          // Set chart options
          var options = {'title' : 'Average Temperatures of Cities',
             hAxis: {
                title: 'Month'
             },
             vAxis: {
                title: 'Temperature'
             },   
             'width':550,
             'height':400	  
          };

          // Instantiate and draw the chart.
          var chart = new google.visualization.LineChart(document.getElementById('container'));
          chart.draw(data, options);
       }
       google.charts.setOnLoadCallback(drawChart);
       // question: comment gérer bootstrap ?
    </script>
 </body>
</html>
*/

/* mdbootstrap: ne marche pas
<!DOCTYPE html>
<html lang="en">
  <head>
      <% include partials/head %>
  </head>
  <body>
      <!-- Grid container -->
<div class="container">

    <!--Grid row-->
    <div class="row d-flex justify-content-center">
  
      <!--Grid column-->
      <div class="col-md-6">
        <canvas id="lineChart"></canvas>
      </div>
      <!--Grid column-->
  
    </div>
    <!--Grid row-->
  
  </div>
  <!-- Grid container -->
    
    <script>
       // question: comment gérer bootstrap ?
       //line
        var ctxL = document.getElementById("lineChart").getContext('2d');
        var myLineChart = new Chart(ctxL, {
            type: 'line',
            data: {
                labels: ["January", "February", "March", "April", "May", "June", "July"],
                datasets: [{
                        label: "My First dataset",
                        data: [65, 59, 80, 81, 56, 55, 40],
                        backgroundColor: [
                            'rgba(105, 0, 132, .2)',
                        ],
                        borderColor: [
                            'rgba(200, 99, 132, .7)',
                        ],
                        borderWidth: 2
                    },
                    {
                        label: "My Second dataset",
                        data: [28, 48, 40, 19, 86, 27, 90],
                        backgroundColor: [
                            'rgba(0, 137, 132, .2)',
                        ],
                        borderColor: [
                            'rgba(0, 10, 130, .7)',
                        ],
                        borderWidth: 2
                    }
                ]
            },
            options: {
                 responsive: true
            }
        });
    </script>
 </body>
</html>
*/