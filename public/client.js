// shorthand for $(document).ready(...)

$(function() {
    var socket = io();
    var username = '';
    
    $('form').submit(function(){
	   socket.emit('chat', $('#m').val());
	   $('#m').val('');
	   return false;
    });
    
    socket.on('chat', function(msg){
        
        if(msg.includes(username)){
            var l = $('#messages').append($('<li>').html('<b>' + msg + '</b>'));
        }
        
        else{
            var l = $('#messages').append($('<li>').html(msg));
        }
    });
    
    socket.on('updateusername', function(usr){
        $('#username li').remove();
        $('#username').append($('<li>').text("Your Username: " + usr));
        username = usr;
        document.cookie = 'username=' + usr;
    });
    
    socket.on('updateusercolor', function(color){
        $('#username li').remove();
        $('#username').append($('<li>').text(usr));
        //document.cookie = 'color=' + color;              
    });
    
    socket.on('clearchat', function(msg){
	   $('#messages li').remove();
    });
   
    socket.on('scrolltobottom', function(msg){
	   $('html,body').animate({scrollTop: document.body.scrollHeight},"fast");
    });
    
     socket.on('adduser', function(usr){
	   $('#onlineusers').append($('<li>').text(usr));
    });
    
    socket.on('clearusers', function(msg){
	   $('#onlineusers li').remove();
    });
});

