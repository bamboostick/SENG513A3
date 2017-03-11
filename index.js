// Number of users to ever use the system
var totalUserCount = 0;

// Tracking online users
var onlineUsers = [];

var colorForUser = {};

// Stores message history in array
var history = [];

// Set up sockets and networking biz
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));

// Listen to 'chat' messages
io.on('connection', function(socket){
    
    
    // When a user first connects
    console.log('a user connected');
    
    var username = '';

    var usernamecookie = getCookie('username',socket.request.headers.cookie);
    console.log(usernamecookie);

    
    if (usernamecookie != ''){
        username = usernamecookie;
    }
    
    else{
        username = generateUserName();
        colorForUser[username] = '#000000';
    }
    
    socket.emit('updateusername', username);
    reloadChatList();
    reloadUserList();
    
    io.emit('scrolltobottom', '');

    
    // Add user name to online users list
    onlineUsers.push(username);
    
    // Add to online users list
    io.emit('adduser', username);
    
    // When a user disconnects
    socket.on('disconnect', function(){
        console.log('user disconnected');
        
        // Remove user name from online users list
        var usernameIndex = onlineUsers.indexOf(username);
        onlineUsers.splice(usernameIndex, 1);
        reloadUserList();
        
    });
    
    // When a user sends a message
    socket.on('chat', function(msg){
        
        // Handle renaming
        if (msg.substr(0,6) == '/nick '){
            
            // Make sure the username is not empty
            if (msg.length > 6) {
                
                // Check if the username is unique
                if (!onlineUsers.includes(msg.slice(6))){
                    
                    
                    // Add a message informing users that the name has changed
                    var formattedmsg = "<p style= 'color:" + colorForUser[username] + ";'>" + getCurrentTime() + ' ' + username + ': changed their nickname to ' + msg.slice(6) + '</p>';
                    io.emit('chat', formattedmsg);
                    history.push(formattedmsg);   
                    
                    // Change the user name on the server
                    username = changeUserName(username,msg.slice(6));
                    
                    reloadUserList()
                    socket.emit('updateusername', username);

                }
            }
        }
        
        else if (msg.substr(0,11) == '/nickcolor '){
            
            // Check if the value follows the proper hex formatting
            // From http://stackoverflow.com/questions/8027423/how-to-check-if-a-string-is-a-valid-hex-color-representation
            if (/^#[0-9A-F]{6}$/i.test(msg.slice(11))){
                colorForUser[username] = msg.slice(11);
                
                // Add a message informing users that the color has changed
                var formattedmsg = "<p style= 'color:" + colorForUser[username] + ";'>" + getCurrentTime() + ' ' + username + ': changed their nickname color to ' + msg.slice(11) + '</p>';
                io.emit('chat', formattedmsg);
                history.push(formattedmsg);   
                
                
            }
        }
        
        // Handle Normal message sending
        else{
            var formattedmsg =  "<p style= 'color:" + colorForUser[username] + ";'>" + getCurrentTime() + ' ' + username + ': '+ msg + '</p>';
            io.emit('chat', formattedmsg);
            io.emit('scrolltobottom', '');
            history.push(formattedmsg);
        }
    });
});


// return the current hour and minute
function getCurrentTime(){
    var currentdate = new Date(); 
    var datetime =  currentdate.getHours() + ':' + currentdate.getMinutes();
    return datetime;
}

// Returns a new username
function generateUserName(){
    totalUserCount++;
    return 'User' + totalUserCount;
}

function changeUserName(oldname, newname){
    // Remove user name from online users list
    var usernameIndex = onlineUsers.indexOf(oldname);
    onlineUsers.splice(usernameIndex, 1);
    
    // Add new user name to online users list
    onlineUsers.push(newname);
    return newname
}

function reloadChatList(){
    // Clear the chat (temporarily)
    io.emit('clearchat', '');
    
    // Load all old messages
    for (msg in history){
        io.emit('chat', history[msg]);
    }
}

function reloadUserList(){
    // Clear the user list (temporarily)
    io.emit('clearusers', '');
    
    // Load all current online users
    for (user in onlineUsers){
        io.emit('adduser', onlineUsers[user]);
    }
}

    
// from http://stackoverflow.com/questions/5142337/read-a-javascript-cookie-by-name
function getCookie(cookiename, cookies) 
  {
  // Get name followed by anything except a semicolon
  var cookiestring=RegExp(""+cookiename+"[^;]+").exec(cookies);
  // Return everything after the equal sign, or an empty string if the cookie name not found
  return unescape(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./,"") : "");
  }