var command = "stand_stop";
var crab_command = "crab";
var command_to_sentence = {
    "stand_stop": "I am standing still.",
    "stand_left": "I am twisting to the left.",
    "stand_right": "I am twisting to the right.",
    "roll_forward": "I am rolling forward.",
    "roll_forward_fast": "I am rolling forward faster.",
    "roll_back": "I am rolling backwards.",
    "roll_back_fast": "I am rolling backwards faster.",
    "roll_stop": "I am not rolling now.",
    "walk_forward": "I am walking forwards.",
    "walk_back": "I am walking backwards.",
    "walk_left": "I am walking to the left.",
    "walk_right": "I am walking to the right.",
    "walk_stop": "I am not walking now.",
    "walking_mode": "Walking Mode.",
    "standing_mode": "Standing Mode.",
    "rolling_mode": "Rolling Mode",
    "rolling_button": "roll_stop",
    "standing_button": "stand_stop",
    "walking_button": "walk_stop"
};
var ros = new ROSLIB.Ros({groovyCompatibility: false});
var calibrate_topic= new ROSLIB.Topic({
    ros : ros,
    name : '/jelly_hardware/calibrate',
    messageType : 'std_msgs/Bool'
});
var command_topic= new ROSLIB.Topic({
    ros : ros,
    name : '/jelly_gui/command',
    messageType : 'std_msgs/String'
});
var crab_topic= new ROSLIB.Topic({
    ros : ros,
    name : '/jelly_control/mode',
    messageType : 'std_msgs/String'
});
var debug_topic = new ROSLIB.Topic({
    ros : ros,
    name : '/jelly_gui/status',
    messageType : 'std_msgs/String'
});


$(document).ready(function() {
    $("#rolling_button").on("click", function() {
        console.log("clicked rolling button");
        if ($(this).hasClass("button-primary")) {
        } else {
            $("#rolling_panel").show();
            $("#standing_panel").hide();
            $("#walking_panel").hide();
            $("#log p").text(command_to_sentence["rolling_mode"]);
            $(this).addClass("button-primary");
            $("#standing_button").removeClass("button-primary");
            $("#walking_button").removeClass("button-primary");

            command = command_to_sentence[$(this).attr("id")];
        }
    });
    $("#standing_button").on("click", function() {
        console.log("clicked standing button");
        if ($(this).hasClass("button-primary")) {
        } else {
            $("#rolling_panel").hide();
            $("#standing_panel").show();
            $("#walking_panel").hide();
            $("#log p").text(command_to_sentence["standing_mode"]);
            $("#rolling_button").removeClass("button-primary");
            $(this).addClass("button-primary");
            $("#walking_button").removeClass("button-primary");

            command = command_to_sentence[$(this).attr("id")];
        }
    });

    $("#walking_button").on("click", function() {
        console.log("clicked walking button");
        if ($(this).hasClass("button-primary")) {

        } else {
            $("#rolling_panel").hide();
            $("#standing_panel").hide();
            $("#walking_panel").show();
            $("#log p").text(command_to_sentence["walking_mode"]);
            $("#rolling_button").removeClass("button-primary");
            $("#standing_button").removeClass("button-primary");
            $(this).addClass("button-primary");

            command = command_to_sentence[$(this).attr("id")];
        }
    });
    $(".crab").on("click", function() {
        if ($(this).hasClass("button-primary")) {
        } else {
            $(".crab_button").removeClass("button-primary");
            $(".crab").addClass("button-primary");
            // $("#log p").text(command_to_sentence[command]);
        }
        crab_command = "crab";
    });
    $(".normal").on("click", function() {
        if ($(this).hasClass("button-primary")) {
        } else {
            $(".crab_button").removeClass("button-primary");
            $(".normal").addClass("button-primary");
            // $("#log p").text(command_to_sentence[command]);
        }
        crab_command = "normal";
    });
    $(".reverse_crab").on("click", function() {
        if ($(this).hasClass("button-primary")) {
        } else {
            $(".crab_button").removeClass("button-primary");
            $(".reverse_crab").addClass("button-primary");
            // $("#log p").text(command_to_sentence[command]);
        }
        crab_command = "reverse_crab";
    });


    // If there is an error on the backend, an 'error' emit will be emitted.
    ros.on('error', function(error) {
        console.log(error);
    });
    // Find out exactly when we made a connection.
    ros.on('connection', function() {
        console.log('Connection made!');
    });
    ros.on('close', function(e) {
        console.log('Connection closed.');
        console.log(e);
    });
    // Create a connection to the rosbridge WebSocket server.
    ros.connect('ws://192.168.1.24:9090');

    setInterval(function() {
        var command_message = new ROSLIB.Message({
            data : command
        });
        var crab_message = new ROSLIB.Message({
            data: crab_command
        });

        $(".control i").on("click", function() {
            command = $(this).attr("id");
            console.log(command);
            $("#log p").text(command_to_sentence[command]);
        });

        command_topic.publish(command_message);
        crab_topic.publish(crab_message);

    }, 100);

    debug_topic.subscribe(function(message) {
        var element = "<p>" + message.data + "</p>";
        $("#debug").prepend(element);
    });

    $("#calibrate").on("click", function() {
        $(this).addClass("button-primary");
        var calibrate_message = new ROSLIB.Message({
            data: true
        });
        calibrate_topic.publish(calibrate_message);
    });

    // Create the main viewer.
    var viewer = new ROS3D.Viewer({
        divID : 'urdf',
        background: '#ffffff', // white background
        width : 800,
        height : 500,
        antialias : true,
        intensity: 2, // brightness of model. keep in mind the shadows.
        displayPanAndZoomFrame : true,
        cameraPose: {x: 1, y: 1.3, z: 0.67}
    });

    // Add a grid
    // viewer.addObject(new ROS3D.Grid());

    // Setup a client to listen to TFs.
    var tfClient = new ROSLIB.TFClient({
        ros : ros,
        angularThres : 0.01,
        transThres : 0.01,
        rate : 10.0,
        groovyCompatability: false
    });

    // Position the dog a little higher.
    viewer.scene.position.set(0, 0, 0.26);

    // Setup the URDF client.
    var urdfClient = new ROS3D.UrdfClient({
        ros : ros,
        tfClient : tfClient,
        path : 'https://raw.githubusercontent.com/AMABerkeley/jelly_descriptions/master/',
        path : '/',
        rootObject : viewer.scene,
        // loader : ROS3D.COLLADA_LOADER_2 //THREE.ColladaLoader
    });

});


