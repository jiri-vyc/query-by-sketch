$(function () {
    var canvas = $('#canvas');
    if(!canvas[0]){
        return;
    }
    var canvas_res;
    var color_picker = $('#color-picker');
    var context = canvas[0].getContext("2d");
    var context_res;
    var canvasWidth = canvas.width();
    var canvasHeight = canvas.height();
    var mouseX = 0;
    var mouseY = 0;
    var currentMouseX = 0;
    var currentMouseY = 0;
    var paint;
    var rect;
    var tool;
    var color;
    var lineWidth;
    var img = document.getElementById("editImage");

    initializeCanvas();

    function initializeCanvas(){
        tool = 'pencil';
        color = '464F61';
        lineWidth = 3;
        color_picker.val('#' + color);

        createResultCanvas();
    }

    function createResultCanvas(){
        var container = canvas[0].parentNode;
        canvas_res = document.createElement('canvas');
        canvas_res.id = 'canvas-temp';
        canvas_res.width = canvasWidth;
        canvas_res.height = canvasHeight;
        container.appendChild(canvas_res);
        context_res = canvas_res.getContext('2d');
    }

    function drawUpdate () {
        context_res.drawImage(canvas[0], 0, 0);
        context.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    canvas.mousedown(function(e){
        context.strokeStyle = '#' + color;
        context.lineWidth = lineWidth;
        if (tool == 'pencil') paint = true;
        if (tool == 'rectangle') rect = true;
        context.beginPath();
        mouseX = e.pageX - this.parentNode.offsetLeft;
        mouseY = e.pageY - this.parentNode.offsetTop;
    });

    canvas.mousemove(function(e){
        currentMouseX = e.pageX - this.parentNode.offsetLeft;
        currentMouseY = e.pageY - this.parentNode.offsetTop;
        if(paint){
            context.lineTo(currentMouseX, currentMouseY);
            context.stroke();
        } else if (rect){
            context.clearRect(0,0,canvasWidth, canvasHeight);
            context.strokeRect(mouseX, mouseY, currentMouseX-mouseX, currentMouseY-mouseY);
        }
    });

    canvas.mouseup(function(e){
        if (tool == 'rectangle'){
            context.rect(mouseX, mouseY, currentMouseX - mouseX, currentMouseY - mouseY);
            context.stroke();
        }
        paint = false;
        rect = false;
        drawUpdate();
    });

    canvas.mouseleave(function(e){
        paint = false;
    });


    $('#save').on('click', function() {
        NProgress.start();
        var imgData = context.getImageData(0, 0, canvasWidth, canvasHeight);

        var newCallback = $(this).data("callback");
        $.post(newCallback,{
            base64: canvas_res.toDataURL("image/png"),
        }, function(result) {
            if (result == 'not ok'){
                flashMessage('Error uploading image', 'error');
            } else {
                context_res.clearRect(0, 0, canvasWidth, canvasHeight);
                context.clearRect(0, 0, canvasWidth, canvasHeight);
                flashMessage('Image saved!', 'success');
                NProgress.done();
                $.get(result, function(data){
                    $('#results').html(data);
                });
            }
        });
    });

    $('#download').on('click', function(){
        var data = canvas_res.toDataURL("image/png");
        window.open(data);
    })

    $('#reset').on('click', function(){
        var imgData = context_res.getImageData(0, 0, canvasWidth, canvasHeight);
        for (var i=0;i<imgData.data.length;i++)
        {
            imgData.data[i]=0;
        }
        context_res.putImageData(imgData,0,0);
    });

    $('#pencil').on('click', function(){
        tool = 'pencil';
        $('.tool').removeClass('active');
        $(this).toggleClass('active');
    });

    $('#rectangle').on('click', function(){
        tool = 'rectangle';
        $('.tool').removeClass('active');
        $(this).toggleClass('active');
    });

    color_picker.on('change',function(){
        color = $(this).val();
    });

    $('.slider').slider({
            orientation : 'horizontal',
            value : 1,
            handle : "square",
            min : 1
        }).on('slideStop', function(){
            lineWidth = $(this).val();
        });
    if(img){
        img.onload = function ()
        {
            context_res.drawImage(img, 0, 0); //draw image into canvas;
        }   
    }
});