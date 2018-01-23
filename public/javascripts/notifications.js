function notify(body1, body2, title) {
  // Let's check if the browser supports notifications
  var ns = getCookie("sharesnum");
  var is = getCookie("is");
  console.log("sharesnum ns : " + ns);
  console.log("sharesnum is: " + is);

  if (!("Notification" in window)) {
    console.log("This application does not support notification");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    var ns_ = 0, is_ = 0;
    var diff = 0;
    if(ns != null && is !=null && ns != undefined && is !=undefined){
        ns_ = parseInt(ns);
        is_ = parseInt(is);
        diff = ns_ - is_;
    }
    console.log("ns_: " + ns_);
    console.log("is_: " + is_);
    console.log("diff: " + diff);

    if(getCookie("notified") == "" || diff > 0){
    // If it's okay let's create a notification
    var options = {
    body: body1 + diff + body2,
    requireInteraction: true
    //icon: "/images/yoke4.png"
    };
   var notification = new Notification(title,options); 
   document.cookie = "notified=true ; is="+ns;
}
   console.log("here : " + getCookie("notified"));
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification(var_title,options);
      }
    });
  }

  // At last, if the user has denied notifications, and you 
  // want to be respectful there is no need to bother them any more.
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}