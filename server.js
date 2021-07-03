var express=require("express");
var mysql=require("mysql");
var bodyParser=require("body-parser");
var nodemailer = require('nodemailer');
var sha256=require('crypto-js/sha256');
var jwt = require('jsonwebtoken');

var secret = "a88a67fdc9f28c3526c3afd9f1852e65";

var app=express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


function myconnection() {
    var connection=mysql.createConnection({
        host:"localhost",
        user:"root",
        password:"manager",
        database:"mean"
    });

    connection.connect();
    return connection;
}

app.listen(3000,"localhost",function(){
    console.log("server started");
})

app.post("/login",function(request,response){
    var connection=myconnection();
    var email=request.body.email;
    //var password=request.body.password;
    var password = sha256(request.body.password);

    query=`select * from Customer where Cemail="${email}" and Cpassword="${password}"`;
    connection.query(query,function(error,result){
        if(result.length==0)
        {
            response.status(401);
            response.send();
        }
        else
        {
            var user=result[0];
            let token = jwt.sign({Cnum:user.Cnum}, secret);
            response.status(200);
            response.header({'x-auth-token': token});
            response.send({ 
                token:token ,
                result:'ok',
                user:{
                    Cnum:user.Cnum,
                    Cname:user.Cname,
                    Caddr:user.Caddr, 
                    Ccity:user.Ccity,
                    Cpincode:user.Cpincode,
                    Cmobno:user.Cmobno,
                    Cemail:user.Cemail
                }
            })
        }
    })
})

app.post("/register",function(request,response){
    var connection=myconnection();
      var Cname=request.body.Cname;
      var Caddr=request.body.Caddr;
      var Ccity=request.body.Ccity;
      var Cpincode=request.body.Cpincode;
      var Cmobno=request.body.Cmobno;
      var Cemail=request.body.Cemail;
      //var Cpassword=request.body.Cpassword;
      var Cpassword = sha256(request.body.Cpassword);
      console.log(Cpassword)
    query=`insert into Customer(Cname,Caddr,Ccity,Cpincode,Cmobno,Cemail,Cpassword) values ("${Cname}","${Caddr}","${Ccity}",${Cpincode},"${Cmobno}","${Cemail}","${Cpassword}")`;
    connection.query(query,function(error,result){
        connection.end();
        if ((error == null) || (error == undefined)) {
            response.send(result);
        }
        else{
            response.send({ 'result': 'error' });
        }
    })
})




app.post("/serviceCenterRegister",function(request,response){
    var connection=myconnection();
      var SCname=request.body.SCname;
      var SCaddr=request.body.SCaddr;
      var SCcity=request.body.SCcity;
      var SCpincode=request.body.SCpincode;
      var SCmobno=request.body.SCmobno;
      var SCemail=request.body.SCemail;
    query=`insert into ServiceCenter(SCname,SCaddr,SCcity,SCpincode,SCmobno,SCemail) values ("${SCname}","${SCaddr}","${SCcity}",${SCpincode},"${SCmobno}","${SCemail}")`;
    connection.query(query,function(error,result){
        connection.end();
        if ((error == null) || (error == undefined)) {
            response.send(result);
        }
        else{
            response.send({ 'result': 'error' });
        }
    })
})

app.get("/getSCnum/:SCemail",function(request,response){
    
    SCemail=request.params.SCemail;
    var connection=myconnection();
    query=`select SCnum from ServiceCenter where SCemail="${SCemail}"`
    connection.query(query,function(error,result){
    connection.end();
    response.send(result);
    })
})

app.post("/addService",function(request,response){
    var connection=myconnection();
      var Sname=request.body.Sname;
      var SCnum=request.body.SCnum;
      var Sprice=request.body.Sprice;
      console.log(Sname,SCnum,Sprice);
    query=`insert into Service (Sname,SCnum,Sprice) values ("${Sname}",${SCnum},${Sprice})`;
    connection.query(query,function(error,result){
        connection.end();
        response.send(result);
    })
})




app.post("/getServiceCenterByCity/:city",function(request,response){
    var token = request.body.token;
    try
    {
        var decoded = jwt.verify(token, secret);
        city=request.params.city;
        var connection=myconnection();
        query=`select * from ServiceCenter where SCcity="${city}";`
        connection.query(query,function(error,result){
        connection.end();
        response.status(200);
        response.send(result);
        })
    }
    catch(ex)
    {
        response.status(401);
        response.send();
    }
    
})

app.post("/getNearByServiceCenter/:pincode",function(request,response){
    var token = request.body.token;
    try
    {
        var decoded = jwt.verify(token, secret);
        pincode=request.params.pincode;
        var connection=myconnection();
        query=`select * from ServiceCenter where SCpincode="${pincode}";`
        connection.query(query,function(error,result){
        connection.end();
        response.status(200);
        response.send(result);
        })
    }
    catch(ex)
    {
        response.status(401);
        response.send();
    }

})

app.post("/getSService/:SCnum",function(request,response){
    var token = request.body.token;
    try
    {
        var decoded = jwt.verify(token, secret);
        SCnum=request.params.SCnum;
        var connection=myconnection();
        query=`select * from Service where SCnum=${SCnum}`
        connection.query(query,function(error,result){
        connection.end();
        response.status(200);
        response.send(result);
        })
    }
    catch(ex)
    {
        response.status(401);
        response.send();
    }
})

app.post("/confirmBooking",function(request,response){
    var token = request.body.token;
    try
    {
        var decoded = jwt.verify(token, secret);
        var connection=myconnection();
        var Cnum=request.body.Cnum;
        var SCnum=request.body.SCnum;
        var date=request.body.date;
        var time=request.body.time;
        var pickup=request.body.pickup;
        var names=request.body.names;
        var total=request.body.total;
        console.log(Cnum,SCnum,date,time,pickup,names,total);
        query=`insert into Booking (Cnum,SCnum,Date,Time,Pickup,Services,Total) values (${Cnum},${SCnum},"${date}","${time}","${pickup}","${names}",${total});`;
        connection.query(query,function(error,result){
        connection.end();
        if ((error == null) || (error == undefined)) {
            response.status(200);
            response.send(result);
        }
        else{
            response.send({ 'result': 'error' });
        }
        })
    }
    catch(ex)
    {
        response.status(401);
        response.send();
    }
})

app.post("/getBookingDetails/:Cnum",function(request,response){
    var token = request.body.token;
    try
    {
        var decoded = jwt.verify(token, secret);
        Cnum=request.params.Cnum;
        var connection=myconnection();
        query=`select Onum,Date,Time,Pickup,Services,Total,SCname from Booking,ServiceCenter where Booking.SCnum=ServiceCenter.SCnum and Cnum=${Cnum}`
        connection.query(query,function(error,result){
        connection.end();
        response.status(200);
        response.send(result);
        })
    }
    catch(ex)
    {
        response.status(401);
        response.send();
    }
})

app.post("/sendEmailToServiceCenter",function(request,response){
    var token = request.body.token;
    try
    {
        var decoded = jwt.verify(token, secret);
        var SCemail=request.body.SCemail;
        var Cname=request.body.Cname;
        var Caddr=request.body.Caddr;
        var Ccity=request.body.Ccity;
        var Cpincode=request.body.Cpincode;
        var Cmobno=request.body.Cmobno;
        var Cemail=request.body.Cemail;

        var date=request.body.date;
        var time=request.body.time;
        var names=request.body.names;
        var pickup=request.body.pickup;
        var total=request.body.total;

        var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'carservicesbooking@gmail.com',
            pass: 'carbooking123'
        }
        });

        var mailOptions = {
        from: 'carservicesbooking@gmail.com',
        to: SCemail,
        subject: 'Booking Details',
        html:   `<h1>Customer Booking Details</h1><br>
                Customer Name :${Cname}<br>
                Address :${Caddr}<br>
                City :${Ccity}<br>
                Pincode :${Cpincode}<br>
                Email :${Cemail}<br>
                Mobile :${Cmobno}<br>
                Services :${names}<br>
                Date :${date}<br>
                Time :${time}<br>
                Pickup :${pickup}<br>
                Total :${total}`
        };

        transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
        });

    } 
    catch(ex)
    {
        response.status(401);
        response.send();
    }

})

app.post("/sendEmailToCustomer",function(request,response){
    var token = request.body.token;
    try
    {
        var decoded = jwt.verify(token, secret);
        var Cemail=request.body.Cemail;

        var SCname=request.body.SCname;
        var SCaddr=request.body.SCaddr;
        var SCcity=request.body.SCcity;
        var SCpincode=request.body.SCpincode;
        var SCmobno=request.body.SCmobno;
        var SCemail=request.body.SCemail;
        
        var date=request.body.date;
        var time=request.body.time;
        var pickup=request.body.pickup;
        var total=request.body.total;
        var names=request.body.names;

        var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'carservicesbooking@gmail.com',
            pass: 'carbooking123'
        }
        });

        var mailOptions = {
        from: 'carservicesbooking@gmail.com',
        to: Cemail,
        subject: 'Booking Details',
        html:  `<h1>Your Booking has been confirmed</h1><br>
                Service Center Name :${SCname}<br>
                Address :${SCaddr}<br>
                City :${SCcity}<br>
                Pincode :${SCpincode}<br>
                Email :${SCemail}<br>
                Mobile :${SCmobno}<br>
                Services :${names}<br>
                Date :${date}<br>
                Time :${time}<br>
                Pickup :${pickup}<br>
                Total :${total}`
        };

        transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
        });
    } 
    catch(ex)
    {
        response.status(401);
        response.send();
    }
})
