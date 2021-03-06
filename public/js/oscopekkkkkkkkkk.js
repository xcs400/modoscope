"use strict";

var oscope = (function() {
  var m_canvas;
  var m_context;
  var m_width;
  var m_height;
  var m_h2;
  var m_trace = [];
  var m_voffset = [];
 
  
 var m_trace0 = [];
 var m_trace1 = [];
 var m_trace2 = [];
 
 // these must match the initial values of the controls
  // doh! no two way data bindind
  var m_seconds_per_div    = 0.00800;
  var m_samples_per_second = 125000;
  var m_divisions          = 10;
  var m_yscale             = 32767;
  var m_sample_bits        = 16;
  var m_volts_per_div      = 0.30;
  var m_vrange             = 6.6;
  var m_cursor_index       = 2;
  var m_cursor_seconds     = 0.0;
  var m_cursor_volts       = 0.0;
  var m_run                = true;
  var m_Correl              = false;
  var m_size_index         = 0;
  var m_text_size          = 15;
  var m_updates            = 0;

  
/*   var m_seconds_per_div    = 0.100;
  var m_samples_per_second = 512;
  var m_divisions          = 10;
  var m_yscale             = 32768;
  var m_sample_bits        = 16;
  var m_volts_per_div      = 0.5;
  var m_vrange             = 5;
  var m_cursor_index       = 2;
  var m_cursor_seconds     = 0.0;
  var m_cursor_volts       = 0.0;
  var m_run                = true;
  var m_size_index         = 0;
  var m_text_size          = 12;
  var m_updates            = 0;
*/
  
  m_trace[0]           = null;
  m_trace[1]           = null;
  m_trace[2]           = null;

  m_voffset[0]         = 0;
  m_voffset[1]         = 0;
 m_voffset[3]         = 0;

  // ==============================================================
  // background display scaffolding
  // ==============================================================
  var outline_base = [
    [0.0,0.0],
    [1.0,0.0],
    [1.0,1.0],
    [0.0,1.0],
    [0.0,0.0]
  ];
  var outline;

  var xaxis_base = [
    [0.0, 5.0/10.0, 1.0,5.0/10.0], // channel 1
    [0.0,5.0/10.0,1.0,5.0/10.0] , // channel 2
    [0.0,5.0/10.0,1.0,5.0/10.0]  // channel 3
  ];
  var xaxis;

  var vdiv_base  =  1.0/10.0;
  var vdiv;

  var mid_div_base = [
    0.0,5.0/10.0,1.0,5.0/10.0
  ];
  var mid_div = [0,0,0,0];

  var hgrid_base = [
    [0.0,1.0/10.0,1.0,1.0/10.0],
    [0.0,2.0/10.0,1.0,2.0/10.0],
    [0.0,3.0/10.0,1.0,3.0/10.0],
    [0.0,4.0/10.0,1.0,4.0/10.0],
    [0.0,5.0/10.0,1.0,5.0/10.0],
    [0.0,6.0/10.0,1.0,6.0/10.0],
    [0.0,7.0/10.0,1.0,7.0/10.0],
    [0.0,8.0/10.0,1.0,8.0/10.0],
    [0.0,9.0/10.0,1.0,9.0/10.0],
  ];var hgrid;

  var vgrid_base = [
    [1.0/10.0,0.0,1.0/10.0,1.0],
    [2.0/10.0,0.0,2.0/10.0,1.0],
    [3.0/10.0,0.0,3.0/10.0,1.0],
    [4.0/10.0,0.0,4.0/10.0,1.0],
    [5.0/10.0,0.0,5.0/10.0,1.0],
    [6.0/10.0,0.0,6.0/10.0,1.0],
    [7.0/10.0,0.0,7.0/10.0,1.0],
    [8.0/10.0,0.0,8.0/10.0,1.0],
    [9.0/10.0,0.0,9.0/10.0,1.0]
  ];
  var vgrid;

  var cursor_base = [
    [0.0,0.0,0.0,1.0],  // 0 horizontal
    [0.0,0.0,0.0,1.0],  // 1 horizontal
    [0.0,0.0,1.0,0.0],  // 2 vertical
    [0.0,0.0,1.0,0.0],  // 3 vertical
  ];
  var m_cursor;

  // responsive sizes for canvas
  // aspect ratio of available sizes needs to be 4 over 3
  // and must fit the twitter boostrap grid size allocated
  var canvas_size = [
    {width:1460,height:1000},
    {width:400,height:300},
    {width:200,height:150}
  ];

  // responsive text size
  var text_size = [
      12,
      8,
      6
  ];

  // ===================================================
  // SCALING AND LAYOUT
  // ===================================================

  /**
   * figure out height of canvas based on window and parent size
   * find the first fit from the canvas_size array
   * only needs to be done when window is resized
   * @param window_height
   * @param parent_width
   * @param parent_height
   * @returns {*}
   */
  function getCanvasSize(window_height,parent_width,parent_height) {
    var r;
	return canvas_size[0];
    if (window_height > parent_height) {
      parent_height = window_height;
    }
    var s = canvas_size.filter(function(v) {
      return ((v.width < parent_width)&&(v.height < parent_height));
    });

    // if nothing matches
    if (s.length <= 0) {
      // use the smallest
      r = s[2];
    }
    else {
      // use first fit
      r = s[0];
    }

    return r;
  }

  /**
   * match text size with canvas width
   * only needs to be done when window is resized
   * @param width of canvas (canvas_size[n] maps to text size[n])
   * @returns {*}
   */
  function getTextSize(width) {
    var s;

    s = canvas_size.reduce(function(p,v,i) {
      return (width <= v.width) ? text_size[i] : p;
    },text_size[2]);

    return s;
  }

  /**
   * rescale layout when size changes
   * start with 'base' for each layout item and
   * rescale it using the new widht and height
   * @param w width
   * @param h height
   */
  function rescale(w,h) {
    // rescale horizontal divisions
    hgrid = hgrid_base.map(function (v) {
      var d = new Array(4);
      d[0] = v[0] * w;
      d[1] = v[1] * h;
      d[2] = v[2] * w;
      d[3] = v[3] * h;
      return d;
    });

    // rescale vertical division size
    vdiv = vdiv_base * h;

    // rescale vertical divisions
    vgrid = vgrid_base.map(function(v) {
      var d = new Array(4);
      d[0] = v[0] * w;
      d[1] = v[1] * h;
      d[2] = v[2] * w;
      d[3] = v[3] * h;
      return d;
    });

    // scale channel axes
    xaxis = xaxis_base.map(function(v) {
      var d = new Array(4);
      d[0] = v[0] * w;
      d[1] = v[1] * h;
      d[2] = v[2] * w;
      d[3] = v[3] * h;
      return d;
    });

    // rescale outline
    outline = outline_base.map(function(v) {
      var d = [0,0];
      d[0] = v[0] * w;
      d[1] = v[1] * h;
      return d;
    });

    // rescale cursor
    m_cursor = cursor_base.map(function(v) {
      var d = new Array(4);
      d[0] = v[0] * w;
      d[1] = v[1] * h;
      d[2] = v[2] * w;
      d[3] = v[3] * h;
      return d;
    });

    // rescale mid divider
    mid_div[0] = mid_div_base[0] * w;
    mid_div[1] = mid_div_base[1] * h;
    mid_div[2] = mid_div_base[2] * w;
    mid_div[3] = mid_div_base[3] * h;
  }

  /**
   * clear the background
   * @param ctx canvas context
   * @param width  of rect



   * @param height of rect
   */
  function clear(ctx,width,height) {
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,width,height);
  }

  /**
   * draw a single line from specified endpoints
   * @param ctx
   * @param x0
   * @param y0
   * @param x1
   * @param y1
   */
  function drawLine(ctx,line)  {
      ctx.beginPath();
      ctx.moveTo(line[0],line[1]);
      ctx.lineTo(line[2],line[3]);
      ctx.stroke();
  }

  /**
   * draw a set of linesvgrid_base
   * @param ctx
   * @param lines array of endpoints
   */
  function drawLines(ctx,lines) {
    lines.forEach(function(v) {
      drawLine(ctx,v);
    });
  }

  /**
   * draw a path from a set of points
   * @param ctx
   * @param path
   */
  function drawPath(ctx,path) {
    ctx.beginPath();
    ctx.moveTo(path[0][0],path[0][1]);
    path.slice(1).forEach(function(v) {
      ctx.lineTo(v[0],v[1]);
    });
    ctx.stroke();
  }

  /**
   * draw the background with the outline, grid etc
   * @param ctx
   * @param width
   * @param height
   */
  function drawBackground(ctx,width,height,voffset) {
    // clear background
    clear(ctx,width,height);

    // draw geometry with cartesian coordinates (0,0) lower left
    ctx.save();
    ctx.translate(0,height);
    ctx.scale(1.0,-1.0);

    // draw the outline
    ctx.save();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth   = 4;
    drawPath(ctx,outline);
    ctx.restore();

    // draw the grid
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth   = 1;
    ctx.setLineDash([1,1]);
    drawLines(ctx,hgrid);
    drawLines(ctx,vgrid);
    ctx.restore();

    // draw the x axes
    ctx.save();
    ctx.translate(0,voffset[0]);
    ctx.strokeStyle = "magenta";
    ctx.lineWidth   = 1;
    drawLine(ctx,xaxis[0]);
    ctx.restore();

    ctx.save();
    ctx.translate(0,voffset[1]);
    ctx.strokeStyle = "yellow";
    ctx.lineWidth   = 1;
    drawLine(ctx,xaxis[1]);
    ctx.restore();

    // draw the cursors
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "blue";
    drawLine(ctx,m_cursor[0]);
    drawLine(ctx,m_cursor[2]);
    ctx.strokeStyle = "orange";
    drawLine(ctx,m_cursor[1]);
    drawLine(ctx,m_cursor[3]);
    ctx.restore();

    ctx.restore();
  }

  /**
   * draw text annotations
   * for text, upper left corner is 0,0 regardless of translation
   * @param ctx
   * @param width
   * @param height
   */
  function drawAnnotations(ctx,width,height,dy)
  {
    var t;
    var y;

    ctx.font = dy.toFixed(0) + "px monospace";
    ctx.fillStyle = "lime";
    y = dy + 1;
    ctx.fillText('seconds/div = ' + m_seconds_per_div.toFixed(4) + '    dS = ' + m_cursor_seconds.toFixed(4),2,y);
    y += dy + 1;
    ctx.fillText('volts/div   = ' + m_volts_per_div.toFixed(4)   + '    dV = ' + m_cursor_volts.toFixed(4) ,2,y);

    t = (m_run) ? ("RUN : " + m_updates.toFixed(0)) : "STOP";
    ctx.fillStyle = (m_run) ? 'lime' : 'red';
    ctx.fillText(t,2,height-4);


  }

  /**
   * vertical scale factor
   * (voltage range/counts per sample) *  (pixels per yaxis / volts per yaxis) = pixel per count
   * @param vrange
   * @param yscale
   * @param height
   * @param volts
   * @returns {number}
   */
  function computeVerticalScale(vrange,yscale,height,volts) {
    // divide by 2 to make scale for signed value
    return (vrange / yscale) * (height / volts) * 0.5;
  }

  /**
   * horizontal scale factor in pixels/sample
   * @param seconds
   * @param sps
   * @param width
   * @returns {number}
   */
  function computeHorizontalScale(seconds,samples_per_second,width) {
    return width / (seconds * samples_per_second);
  }

  /**
   * draw a single trace
   * @param ctx
   * @param trace
   * @param width used to scale x axis
   * @param height used to scale y axis
   */
  function drawTrace(ctx,trace,width,height,voffset1,voffset2) {
    var t = [];
    var t1 = [];
	var t2 = [];
	 var ys;
    var hs;
    var i;

    // compute scale factors
    ys = computeVerticalScale(m_vrange,m_yscale,m_height,m_volts_per_div*10);
    hs = computeHorizontalScale(m_seconds_per_div*m_divisions,m_samples_per_second,m_width);

    // compute horizonal scale

    ctx.save();
    ctx.translate(0,height);
    ctx.scale(1.0,-1.0);

    // set channel parameters
 /*  switch(2) {
    case 1:
      ctx.translate(xaxis[0][0],xaxis[0][1] + voffset1);
      ctx.strokeStyle = "red";
      break;
    case 2:
      ctx.translate(xaxis[1][0],xaxis[1][1] + voffset2);
      ctx.strokeStyle = "lime";
      break;
    }
 */  
  
	var ndata =trace.length ;
  
    ctx.translate(xaxis[0][0],xaxis[0][1] + voffset1);
    ctx.strokeStyle = "red";

  // voie 1  no mux
	 
    for(i=0;i<ndata;++i) {
      t.push([i*hs,trace.sample[i] * ys]);
    }
	    // draw it
    drawPath(ctx,t);
    ctx.restore();  
 
 
 //-------------------------------------------------------------------
	 
	// trace correlation
	
   ctx.save();
   
    ctx.translate(0,height);
    ctx.scale(1.0,-1.0);
	
	ctx.translate(xaxis[2][0],xaxis[2][1] + 0);
    ctx.strokeStyle = "blue";
 
    // scale the trace y axis
    // samples are Int16Array
  //  for(i=0;i<trace.length;++i) {
	 var peak=0;
	 var peakpos=0;
	 var v;
	 
    for(i=0 ;i< trace.length ;++i) {
		v= trace.sample[trace.length*2 + i];
		if (v>peak)
			{peak=v;
			peakpos=i;
			}
			
		
      t2.push([i*hs,trace.sample[trace.length*2 + i] * ys]);
    }

    // draw it
    drawPath(ctx,t2);
		
	 ctx.restore(); 
	
	
	
//----------------------------------------------- 
//trace 2
   ctx.save();
   
    ctx.translate(0,height);
    ctx.scale(1.0,-1.0);
	
	//   var t1= (peakpos* 1/ m_samples_per_second ) + 0.000000001;
	   
	   
	if (m_Correl== true)
		ctx.translate(xaxis[1][0]- peakpos*hs,xaxis[1][1] + voffset2);
	else
		ctx.translate(xaxis[1][0],xaxis[1][1] + voffset2);

    ctx.strokeStyle = "lime";
 
    // scale the trace y axis
    // samples are Int16Array
  //  for(i=0;i<trace.length;++i) {
	  
	  
    for(i=0;i<ndata;++i) {
      t1.push([i*hs,trace.sample[ndata+i] * ys]);
    }

    // draw it
    drawPath(ctx,t1);
	 ctx.restore();   


//----------------------------------text 
	   ctx.save();
 
 //   ctx.translate(0,height);
 //   ctx.scale(1.0,1.0);
	
    ctx.font = "15px monospace";
    ctx.fillStyle = "white";
   
    var t= (peakpos* 1/ m_samples_per_second ) + 0.000000001;
	var v= 0.025/ t;
   var txt = 'max :' + peak + '  pos = ' + peakpos + 'sample   ' + t + 'us'  + 	' avec D=25mm  V=' + v + 'm/s';


  ctx.fillText( txt , 0, 50); 

	
	
	
	
	
	 ctx.restore(); 
	 
	 
	 
	 
    // restore context
  }

  
  
  
  
  
  
   function drawSimpleTrace(ctx, trace,width,height,voffset1,voie, color, text) {
    var t = [];

	 var ys;
    var hs;
    var i;

    // compute scale factors
    ys = computeVerticalScale(m_vrange,m_yscale,m_height,m_volts_per_div*10);
    hs = computeHorizontalScale(m_seconds_per_div*m_divisions,m_samples_per_second,m_width);

    // compute horizonal scale

	 
   ctx.save();
   
    ctx.translate(0,height);
    ctx.scale(1.0,-1.0);
	  
	   
	ctx.translate(xaxis[voie][0],xaxis[voie][1] + voffset1);
    ctx.strokeStyle = color;
 
    // scale the trace y axis
    // samples are Int16Array
  //  for(i=0;i<trace.length;++i) {
	 var peak=0;
	 var peakpos=0;
	 var v;
	 
// voie 1  no mux
	 var key=0
	 for( key in trace)
			{
			var  pts =trace[key]
				var j=pts[0];
			  var value = pts[1];
			  
			if (value>peak)
				{peak=v;
				peakpos=i;
				}
			t.push([j*hs, value * ys]);
//			t.push([j, value ]);
			}

			
	    // draw it
    drawPath(ctx,t);
		
	 ctx.restore(); 
	
	

//----------------------------------text 
 if (text !="")
	{
		ctx.save();
 
 //   ctx.translate(0,height);
 //   ctx.scale(1.0,1.0);
	
    ctx.font = "15px monospace";
    ctx.fillStyle = "white";
   
    var t= (peakpos* 1/ m_samples_per_second ) + 0.000000001;
	var v= 0.025/ t;
   var txt = 'max :' + peak + '  pos = ' + peakpos + 'sample   ' + t + 'us'  + 	' avec D=25mm  V=' + v + 'm/s';

  ctx.fillText( txt , 0, 50); 
	
	
	 ctx.restore(); 
	 
	} 
 
	 
    // restore context
  }

  
  
  
  
  
  
  /**
   * repaint the display
   * @param trace optional trace
   */
  function onPaint(trace) {
    // draw oscope background
    drawBackground(m_context,m_width,m_height,m_voffset);

	
    // update trace if running and there is a new trace
    if (m_run & (trace !== null)) {
      // count updates
      m_updates++;
      // store the trace by channel
 //     m_trace[trace.channel - 1] = trace;
 	m_trace[0]=trace;

	var t=trace.length;
	
			 m_trace0= [];
		 m_trace1=[];
		 m_trace2=[];
	var ind=0;
	 for ( var key in  trace.sample)
	 {

		if (ind <  t)
			m_trace0.push([key,trace.sample[key]]);
		else
			if (ind <  t*2)
				m_trace1.push([key-t,trace.sample[key]]);
			else
				m_trace2.push([key-t-t,trace.sample[key]]);
		ind++;
		
	  }

	}
    		
		
		
    // draw last traces
  //  drawTrace(m_context, trace, m_width, m_height, m_voffset[0]);
    if (m_trace[0] !== null)
		{
			drawTrace(m_context,  m_trace[0] , m_width, m_height, m_voffset[0],m_voffset[1]);
  
		}
 // if (m_trace[0] !== null) {
 //     drawTrace(m_context, m_trace[0], m_width, m_height, m_voffset[0]);
  //  }
  //  if (m_trace[1] !== null) {
  //    drawTrace(m_context, m_trace[1], m_width, m_height, m_voffset[1]);
  //  }

    // draw text annotations
    drawAnnotations(m_context,m_width,m_height,m_text_size);
  }

  // ===================================================
  // EVENT HANDLERS
  // ===================================================

  /**
   * event handler for setting number of bits per sample
   * @param bits
   */
  function onSampleBits(bits) {
    switch(bits) {
    case 8:
      m_sample_bits = 8;
      m_yscale      = 128;
      break;
    case 12:
      m_sample_bits = 12;
      m_yscale      = 2048;
      break;
    case 16:
      m_sample_bits = 16;
      m_yscale      = 32768;
      break;
    default:
      m_sample_bits = 16;
      m_yscale      = 32768;
      break;
    }
    onPaint(null);
  }

  function onVerticalOffset(channel,offset)
  {
    if ((offset < -4)||(4 < offset)) {
      return;
    }
    m_voffset[channel-1] = offset * vdiv;
    onPaint(null);
  }

  /**
   * event handler for setting volts per division
   * @param volts
   */
  function onVoltsPerDiv(volts) {
    m_volts_per_div = volts;

    updateCursorDiff();
    onPaint(null);
  }

  /**
   * event handler for setting seconds per division
   * @param seconds
   */
  function onSecondsPerDiv(seconds) {
    m_seconds_per_div = seconds;

    updateCursorDiff();
    onPaint(null);
  }

  /**
   * event handler for samples per second
   * @param samples_per_second
   */
  function onSamplesPerSecond(samples_per_second) {
    // no zero or negative
    if (samples_per_second < Number.MIN_VALUE) {
      m_samples_per_second = 512;
    }
    else {
      // rate is in samples/second
      m_samples_per_second = samples_per_second;
    }
    onPaint(null);
  }

  /**
   * set voltage range (maximum volts per sample)
   * @param vrange
   */
  function onVoltageRange(vrange) {
    m_vrange = vrange;
    onPaint(null);
  }

  /**
   * compute cursor diff (changes with seconds/div)
   */
  function updateCursorDiff() {
    // compute current cursor diff in seconds
    m_cursor_seconds = Math.abs(m_cursor[0][0] - m_cursor[1][0]) * (m_seconds_per_div * 10.0 / m_width);
    m_cursor_volts   = Math.abs(m_cursor[2][1] - m_cursor[3][1]) * (m_volts_per_div   * 10.0 / m_height);
  }

  /** set cursor
   * @param x x position
   */
  function onCursorMove(x,y) {
    var cursor = m_cursor[m_cursor_index];
    switch(m_cursor_index) {
    case 0:
    case 1:
      cursor[0] = x;
      cursor[2] = x;
      break;
    case 2:
    case 3:
      cursor[1] = m_height - y;
      cursor[3] = m_height - y;
      break;
    }

    updateCursorDiff();
    onPaint(null);
  }

  /**
   * select which cursor to use
   * @param index
   */
  function onCursorSelect(index) {
    m_cursor_index = index;
  }

  /**
   * run = show traces, stop = show last trace
   * @param run
   */
  function onRunStop(run) {
    m_run = run;
  }

  function onCorrel(run) {
    m_Correl = run;
	   onPaint(null);
  }
    
  
  
  /**
   * event handler for window resize
   */
  function onResize() {
    var parent = $("#oscope-parent");
    var size = getCanvasSize($(window).height(),parent.width(),parent.height());
    m_text_size = getTextSize(size.width);
    m_canvas = $("#oscope")[0];
    m_width  = m_canvas.width  = size.width;
    m_height = m_canvas.height = size.height;
    m_h2     = m_height / 2;
    rescale(m_width,m_height);
    onPaint(null);
  }

  /**
   * initialize the oscope
   */
  function onInit() {
    m_canvas  = $("#oscope")[0];
    m_context = m_canvas.getContext("2d");
    // attach resize event
    $(window).resize(onResize);
    onResize();
    onPaint(null);
  }


  return {
    init               : onInit,
    onResize           : onResize,
    onPaint            : onPaint,
    onSampleBits       : onSampleBits,
    onVoltsPerDiv      : onVoltsPerDiv,
    onSecondsPerDiv    : onSecondsPerDiv,
    onSamplesPerSecond : onSamplesPerSecond,
    onVoltageRange     : onVoltageRange,
    onVerticalOffset   : onVerticalOffset,
    onCursorMove       : onCursorMove,
    onCursorSelect     : onCursorSelect,
    onRunStop          : onRunStop,
    onCorrel          : onCorrel
	};
})();

// start the client application
var socket = io.connect();
var messages = 0;
socket.on('trace', function (msg) {
  var trace = JSON.parse(msg);
  messages ++;
  oscope.onPaint(trace);
});

socket.on('disconnect',function() {
  console.log('disconnected');
});

$("document").ready(function() {
  if (oscope) {
    oscope.init();
  }
});
