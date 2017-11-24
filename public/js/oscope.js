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

 var m_trace3 = [];
 var m_trace4 = [];
 var m_trace5 = [];
 
 
  var m_fullsignal = [];
 
m_fullsignal[0]=0;
m_fullsignal[1]=0;
m_fullsignal[2]=0;

 
 
 var m_volts_per_div= [];
 
 // these must match the initial values of the controls
  // doh! no two way data bindind
  var m_seconds_per_div    = 0.00800;
  var m_samples_per_second = 125000;
  var m_divisions          = 10;
  var m_yscale             = 32767;
  var m_sample_bits        = 16;
//  var m_volts_per_div      = 0.30;
  
  m_volts_per_div[0]      = 1;
  m_volts_per_div[1]      = 1;
  m_volts_per_div[2]      = 1;
  
   var m_selectedchannel             = 0;
 
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

  m_trace[3]           = null;
  m_trace[4]           = null;
  m_trace[5]           = null;

  
  m_voffset[0]         = 0;
  m_voffset[1]         = 0;
 m_voffset[2]         = 0;
  m_voffset[3]         = 0;
  m_voffset[4]         = 0;
 m_voffset[5]         = 0;

 var peakpos= [];
 peakpos[0] =0;
 peakpos[1] =0;
 peakpos[2] =0;
 peakpos[3] =0;
 peakpos[4] =0;

 
 var m_cros = [];
   m_cros[0] = [0,0];
   m_cros[1] = [0,0];
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
    [0.0,5.0/10.0,1.0,5.0/10.0] , // channel 3
     [0.0, 5.0/10.0, 1.0,5.0/10.0], // channel 4
    [0.0,5.0/10.0,1.0,5.0/10.0] , // channel 5
    [0.0,5.0/10.0,1.0,5.0/10.0]  // channel 6
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
  //  m_cursor = cursor_base.map(functio
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


  function drawCros(ctx,x)  {
	 
    // draw geometry with cartesian coordinates (0,0) lower left
    ctx.save();
    ctx.translate(0,m_height);
    ctx.scale(1.0,-1.0);

	if ( x==0)
		   ctx.strokeStyle = 'magenta';
	else   
		   ctx.strokeStyle = 'yellow';
	   
    ctx.lineWidth   = 1;
	  
      ctx.beginPath();
      ctx.moveTo(m_cros[x][0],m_cros[x][1]-10);
      ctx.lineTo(m_cros[x][0],m_cros[x][1]+10);
      ctx.stroke();
	     ctx.restore();

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
		ctx.setLineDash([1, 20]);
    ctx.strokeStyle = "magenta";
    ctx.lineWidth   = 1;
    drawLine(ctx,xaxis[0]);
    ctx.restore();

    ctx.save();
    ctx.translate(0,voffset[1]);
		ctx.setLineDash([1, 20]);
    ctx.strokeStyle = "yellow";
    ctx.lineWidth   = 1;
    drawLine(ctx,xaxis[1]);
    ctx.restore();

    // draw the cursors
	
	
    ctx.save();
	
	
	if (m_selectedchannel==0)
		  ctx.strokeStyle = "magenta";
	if (m_selectedchannel==1)
		  ctx.strokeStyle = "yellow";
	if (m_selectedchannel==2)
		  ctx.strokeStyle = "blue";

	
    ctx.lineWidth = 1;
  	
	ctx.setLineDash([2, 1]);
//	drawCros(ctx,0);
//	drawCros(ctx,1);
	
	
    drawLine(ctx,m_cursor[0]);
	ctx.setLineDash([5, 3]);
    drawLine(ctx,m_cursor[1]);
	

	
   
	ctx.setLineDash([2, 1]);
    drawLine(ctx,m_cursor[2]);
	ctx.setLineDash([5, 3]);
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

      ctx.font = "15px monospace";
//	  ctx.font = dy.toFixed(8) + "px monospace";
    ctx.fillStyle = "lime";
    y = dy + 1;
    ctx.fillText('seconds/div = ' + m_seconds_per_div.toFixed(4) + '    dS = ' + m_cursor_seconds.toFixed(4),2,y);
    y += dy + 1;
	if (m_selectedchannel==0 )
	   ctx.fillStyle = "magenta";
	if (m_selectedchannel==1 )
	   ctx.fillStyle = "Yellow";
	if (m_selectedchannel==2 )
	   ctx.fillStyle = "Blue";
	   
   // ctx.fillText('volts/div   = ' + m_volts_per_div.toFixed(4)   + '    dV = ' + m_cursor_volts.toFixed(4) ,2,y);
  ctx.fillText('Selected Cursor is on Cannel ' + (m_selectedchannel+1) + '    volts/div:' + m_volts_per_div[m_selectedchannel].toFixed(4) +   '   ABS(V1-V2)=' + m_cursor_volts.toFixed(4)+'Volt' ,2,y);
     var tri1pos=0
	var key=0;

	 y += dy + 3;
	 
	   

	  var ys = computeVerticalScale(m_vrange,m_yscale,m_height,m_volts_per_div[m_selectedchannel]*10);
	var curslevl_V1=	(m_cursor[2][1]-500- m_voffset[m_selectedchannel] ) * m_volts_per_div[m_selectedchannel]  * 10.0 / m_height   ;
	var curslevel_binary_V1=	(m_cursor[2][1]-500- m_voffset[m_selectedchannel] ) /ys  ;

	var curslevl_V2=	(m_cursor[3][1]-500- m_voffset[m_selectedchannel] ) * m_volts_per_div[m_selectedchannel]  * 10.0 / m_height   ;
	var curslevel_binary_V2=	(m_cursor[3][1]-500- m_voffset[m_selectedchannel] ) /ys  ;

		ctx.fillText( 'V1 Cursor  value(binary) :' + curslevel_binary_V1.toFixed(4) +  "  cursor level(Volt) " + curslevl_V1.toFixed(4) ,2,y);
	y += dy + 3;
		ctx.fillText( 'V2 Cursor  value(binary) :' + curslevel_binary_V2.toFixed(4) +  "  cursor level(Volt) " + curslevl_V2.toFixed(4) ,2,y);

		
	
	
	// cherche sur les deux trace pour calculer l'ecart
		var curslevel_binary_ontrace0=	(m_cursor[2][1]-500- m_voffset[0] ) /ys  ;
		var curslevel_binary_ontrace1=	(m_cursor[2][1]-500- m_voffset[1] ) /ys  ;
	    var  hs = computeHorizontalScale(m_seconds_per_div*m_divisions,m_samples_per_second,m_width);


	
	  ctx.fillStyle = "lime";
  	if (m_trace0.length != 0)
			{
				tri1pos=0;
			if (m_trace0[0][1] > curslevel_binary_ontrace0  )
				for (  key in m_trace0 )
					{if  (m_trace0[key][1] <curslevel_binary_ontrace0  &&  m_trace0[key][1]!=0)
								{tri1pos=key;
								break;
								}
					}
			else
				for (  key in m_trace0 )
						{if  (m_trace0[key][1] > curslevel_binary_ontrace0  &&  m_trace0[key][1]!=0)
								{tri1pos=key;
								break;
								}
						}
			 y += dy + 3;
				ctx.fillText('trig :  value=' + m_trace0[tri1pos][1] + ' @pos:'  + m_trace0[tri1pos][0]    ,2,y);
				
				m_cros[0][0]=m_trace0[tri1pos][0]* hs;
				m_cros[0][1]=m_cursor[2][1];
				
				drawCros(ctx,0);
			 }

			 
	if (m_trace1.length != 0)
			{
				tri1pos=0;
		if (m_trace1[0][1] > curslevel_binary_ontrace1)
			for (  key in m_trace1 )
					{if  (m_trace1[key][1] <curslevel_binary_ontrace1)
								{tri1pos=key;
								break;
								}
					}
		else
			for (  key in m_trace1 )
					{if  (m_trace1[key][1] > curslevel_binary_ontrace1)
							{tri1pos=key;
							break;
							}
					}
				y += dy + 3;
				ctx.fillText('trig :  value=' + m_trace0[tri1pos][1] + ' @pos:'  + m_trace0[tri1pos][0]    ,2,y);
				m_cros[1][0]=m_trace0[tri1pos][0] * hs;
				m_cros[1][1]= m_cursor[2][1];
				drawCros(ctx,1);


			var t= ( (m_cros[1][0] - m_cros[0][0] ) /hs  * 1/ m_samples_per_second ) ;
			var v= 0.025/ t;
			var txt = ' sample ' + t + 'us'  + 	' avec D=25mm  V=' + v + 'm/s';
			ctx.fillText(txt  ,300,y);

   
			}
			 ;
  
 
 
			
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


  
  
  
  
   function drawSimpleTrace(ctx, trace,width,height,voffset1,voie, color, text , shift) {
    var t = [];

	 var ys;
    var hs;
    var i;

    // compute scale factors
    ys = computeVerticalScale(m_vrange,m_yscale,m_height,m_volts_per_div[voie]*10);
    hs = computeHorizontalScale(m_seconds_per_div*m_divisions,m_samples_per_second,m_width);

    // compute horizonal scale

	 
   ctx.save();
   
    ctx.translate(0,height);
    ctx.scale(1.0,-1.0);
	  
	ctx.translate(xaxis[voie][0]-  shift ,xaxis[voie][1] + voffset1);
		
    ctx.strokeStyle = color;
 
    // scale the trace y axis
    // samples are Int16Array
  //  for(i=0;i<trace.length;++i) {
	 var peak=0;
	 var i_peakpos=0;
	 var v;
	 
// voie 1  no mux
	 var key=0
	 for( key in trace)
			{
			var  pts =trace[key]
				var j=pts[0];
			  var value = pts[1];
			  
			if (value>peak)
				{peak=value;
				i_peakpos=j;
				}
			t.push([j*hs, value * ys]);

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
	
    ctx.font = "20px monospace";
    ctx.fillStyle = "white";
   
    var t= (i_peakpos* 1/ m_samples_per_second ) + 0.000000001;
	
	
	peakpos[voie]=i_peakpos*hs;
	
	var v= 0.025/ t;
   var txt = 'max :' + peak + '  pos = ' + i_peakpos + ' sample   ' + t + 'us'  + 	' avec D=25mm  V=' + v + 'm/s';

    ctx.fillText( txt , 0, 110); 
	
	
	 ctx.restore(); 
	 
	} 
 
	 
    // restore context
  }

  
  
  
  
  
  
  /**
   * repaint the display
   * @param trace optional trace
   */
  function settracetcp(trace) {
  
    if (m_run & (trace !== null)) {
      // count updates
      m_updates++;
      // store the trace by channel
 //     m_trace[trace.channel - 1] = trace;
		m_trace[0]=trace;


		var ind=0;
		
		if (trace.tcp ==1)
			{
			if (trace.voie ==0)
				{
				m_trace0=trace.signal;
				}
			if (trace.voie ==1)
				{m_trace1=trace.signal;
				}
			if (trace.voie ==2)
				{m_trace2=trace.signal;
				   	oscope.onPaint(null);
 
				}

			}
	
	 		
	}	
	

  }

  
  
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
		

		var ind=0;
		
		if (trace.tcp ==1)
			{
			if (trace.voie ==0)
				{
				m_trace0=trace.signal;
				}
			if (trace.voie ==1)
				{m_trace1=trace.signal;
				}
			if (trace.voie ==2)
				m_trace2=trace.signal;
			
			}
		else
		{
			 m_trace3= [];
			 m_trace4=[];
			 m_trace5=[];
			 for ( var key in  trace.sample)
			 {

				if (ind <  t)
					m_trace3.push([key,trace.sample[key]]);
				else
					if (ind <  t*2)
						m_trace4.push([key-t,trace.sample[key]]);
					else
						m_trace5.push([key-t-t,trace.sample[key]]);
				ind++;
				
			  }
		}
	}
    		
		
		
    // draw last traces
  //  drawTrace(m_context, trace, m_width, m_height, m_voffset[0]);
   if ( m_trace[0] !== null  )
   {
		if (m_trace0.length != 0)	{
				drawSimpleTrace(m_context,  m_trace0 , m_width, m_height,  m_voffset[0], 0, "magenta", "",0);
			}

		if (m_trace1.length != 0  && m_trace2.length != 0) {
			if (m_Correl== true)
				drawSimpleTrace(m_context,  m_trace1 , m_width, m_height,  m_voffset[1], 1, "green", "" , peakpos[2]);   // la corelation doit etre calulé et afficé
			else
				drawSimpleTrace(m_context,  m_trace1 , m_width, m_height,  m_voffset[1], 1, "yellow", "" , 0);
			}	

		 
		if (m_trace2.length != 0) {
			drawSimpleTrace(m_context,  m_trace2 , m_width, m_height,  m_voffset[2], 2, "Blue", "txt" , 0);

		 }
	
		if (m_trace3.length != 0)	{	
			drawSimpleTrace(m_context,  m_trace3 , m_width, m_height,  m_voffset[0], 0, "red", "" , 0);
			}

		if (m_trace4.length != 0) {
			drawSimpleTrace(m_context,  m_trace4 , m_width, m_height,  m_voffset[1], 1, "green", "yes" , 0);
			}

		 
		  if (m_trace5.length != 0) {
			drawSimpleTrace(m_context,  m_trace5 , m_width, m_height,  m_voffset[2], 0, "white", "" , 0);
			}
	}	
	
		
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
    if ((offset < -10)||(10 < offset)) {
      return;
    }
    m_voffset[channel-1] = offset * vdiv;
    onPaint(null);
  }

  /**
   * event handler for setting volts per division
   * @param volts
   */
  function onVoltsPerDiv(channel,volts) {
    m_volts_per_div[channel] = volts;
	m_selectedchannel=channel;
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
    m_cursor_volts   = Math.abs(m_cursor[2][1] - m_cursor[3][1]) * (m_volts_per_div[m_selectedchannel]   * 10.0 / m_height  );

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
	
	if (run==true)
		var v=1;
	else
		var v=0;
	
var url="http://192.168.0.31/?.*CONF_VS_ParametresConfiguration.vs_confGlanum.StartStopScope=" + v + "&-*Execute.(*Appliquescope)(void)";
	  
  var request = makeHttpObject();
  request.open("GET", url, true);
  request.send(null);
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
      if (request.status == 200)
        ;
      else if (failure)
        ;
    }
  }
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



  
function swap4(val) {
val=val&0xFFFF;

if ((val&0xf000)  == 0)
	val=val<<4;

if ((val&0xf000)  == 0)
	val=val<<4;

if ((val&0xf000)  == 0)
	val=val<<4;






var rem=val&0xf000;
var s= rem>>12;

rem=val&0xf00;
s= s+ (rem>>4);


 rem=val&0xf0;
 s= s + (rem <<4);

rem=val&0xf;
s= s+ (rem<<12);




return s;
		   }

  
function traite(responseText)
{
if (   responseText != '' )
  if (responseText != "no new data"  )
	{
//		4|4|10|25|256|5700107|4294967105|4294966535|678|M0,3051 l +4+3045+4-3

	var pos= responseText.indexOf("M0")
    var fin=responseText.substring(pos+1) 
	var debut= responseText.substring(0, pos ) 
	var tableau=debut.split('|');
	var point=fin.split('!');
	var mystring= point[1];

	var org= point[0].split(',');;
		
	var signal=[];
	var toggle=0x0;


	var Rtoggle=0;

	var pos=0;
	var y=0;
	var lasty=parseInt(org[1]);
	var n=0;

 for (var i =0; i<mystring.length;i++)
		{ //ar x= mystring[i];
			var as=mystring.charCodeAt(i)
			if ( as >= 0x50)  
				Rtoggle=0x20;
			else
				Rtoggle=0;
			
		   if (Rtoggle  != toggle)
			{

	//		y=swap4(y);
			if ( pos==1)
				lasty=lasty+y;
			else
				lasty=lasty-y;
				
			signal.push([n*4, lasty/2 ]);    // div par 2 pour etre en signé comme server node qui divise par 2 aussi 
			
			y=0;
			toggle+= 0x20 	;
			toggle&= 0x20 	;
	
			n++;
			}

			as -= Rtoggle;
		 
		   if ( as < 0x40)   // nombrepos
				{pos=1;
				y=y*16 + ( (as-0x30)) ;
				}
			else
				{pos=0;
				y=y*16 + ( (as-0x40)) ;
				}

		}
		
i=n;
	 
	/*var trace= {"center":tableau[0],
				 "pretrig":tableau[1],
				 "seuiltrigger":tableau[2],
				 "NBBUFFER_":tableau[3],
				 "NB_ELEMENT_":tableau[4],
				 "cycle":tableau[5],
				 "moyenne":tableau[6],
				 "min":tableau[7],
				 "max":tableau[8] ,
	 			 "voie":tableau[9] ,
				 "sample":signal};
	 */

		
	var trace= {"length":i ,"tcp":1, "voie":tableau[9],  "lengthsig":i, "signal":signal};
	  
	oscope.settracetcp(trace);
 
	}

	
	
 setTimeout('oscope.go()',1)
}


function copydata()
{
	  // requette pour recupere les 3 traces
   simpleHttpRequest("http://192.168.0.31/?-*Execute.(*Readfullscope)(void)", traitefullscope);
   simpleHttpRequest("http://192.168.0.31/?-*Execute.(*Readfullscope)(void)", traitefullscope);
   simpleHttpRequest("http://192.168.0.31/?-*Execute.(*Readfullscope)(void)", traitefullscope);

 
 }
  
  
  
  function traitefullscope(responseText)
{
if (   responseText != '' )
  if (responseText != "no new data"  )
	{
//		4|4|10|25|256|5700107|4294967105|4294966535|678|M0,3051 l +4+3045+4-3

	var pos= responseText.indexOf("M0")
    var fin=responseText.substring(pos+1) 
	var debut= responseText.substring(0, pos ) 
	var tableau=debut.split('|');
	var point=fin.split('!');
	var mystring= point[1];

	var org= point[0].split(',');;
		
	var signal=[];
	var toggle=0x0;


	var Rtoggle=0;

	var pos=0;
	var y=0;
	var lasty=parseInt(org[1]);
	var n=0;

 for (var i =0; i<mystring.length;i++)
		{ //ar x= mystring[i];
			var as=mystring.charCodeAt(i)
			if ( as >= 0x50)  
				Rtoggle=0x20;
			else
				Rtoggle=0;
			
		   if (Rtoggle  != toggle)
			{

	//		y=swap4(y);
			if ( pos==1)
				lasty=lasty+y;
			else
				lasty=lasty-y;
				
			signal.push( lasty);    // div par 2 pour etre en signé comme server node qui divise par 2 aussi 
			
			y=0;
			toggle+= 0x20 	;
			toggle&= 0x20 	;
	
			n++;
			}

			as -= Rtoggle;
		 
		   if ( as < 0x40)   // nombrepos
				{pos=1;
				y=y*16 + ( (as-0x30)) ;
				}
			else
				{pos=0;
				y=y*16 + ( (as-0x40)) ;
				}

		}
		
i=n;
	 
	/*var trace= {"center":tableau[0],
				 "pretrig":tableau[1],
				 "seuiltrigger":tableau[2],
				 "NBBUFFER_":tableau[3],
				 "NB_ELEMENT_":tableau[4],
				 "cycle":tableau[5],
				 "moyenne":tableau[6],
				 "min":tableau[7],
				 "max":tableau[8] ,
	 			 "voie":tableau[9] ,
				 "sample":signal};
	 */

		
//	var trace= {"length":i ,"tcp":1, "voie":tableau[9],  "lengthsig":i, "signal":signal};
	  
	  var champ= "#data0";
		
		m_fullsignal[tableau[9]]=signal.length + "; " + signal.join(";") ;
		$(champ).html(   m_fullsignal[0] +"<br>"  + m_fullsignal[1] +"<br>" +  m_fullsignal[2] );
		
	}


}



function makeHttpObject() {
  try {return new XMLHttpRequest();}
  catch (error) {}
  try {return new ActiveXObject("Msxml2.XMLHTTP");}
  catch (error) {}
  try {return new ActiveXObject("Microsoft.XMLHTTP");}
  catch (error) {}
  throw new Error("Could not create HTTP request object.");
}

function simpleHttpRequest(url, success, failure) {
  var request = makeHttpObject();
  request.open("GET", url, true);
  request.timeout = 5000;
  
  request.send(null);
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
      if (request.status == 200)
        success(request.responseText);
      else if (failure)
        failure(request.status, request.statusText);
    }
  };
}




  function readEtatscope()
 {
  simpleHttpRequest("http://192.168.0.31/?-*Execute.(*Getscope)(void)", traiteetatscope, discon);

  setTimeout('oscope.readEtatscope()',1000)
  
 }
 function traiteetatscope(responseText)
{
if (   responseText != '' )
  {
	    var etat = JSON.parse(responseText);
		if (etat.StartStopScope==1)
			{ 
			$('#btn-run' ).parent().attr('class', "btn btn-primary active");
			$('#btn-stop').parent().attr('class', "btn btn-primary");

			

	
			$("#runstate").html("<h4><span class='blink_text'>Running, waiting for data..</span></h4>");
			
							
			
				   
			}
		else
 			{ 
			$('#btn-run' ).parent().attr('class', "btn btn-primary");
			$('#btn-stop').parent().attr('class', "btn btn-primary active");
				
			$("#runstate").html("<h4>Not Running , Paused .</h4>");
		}

 
	}
}

 function discon()
 {
	 
	$("#runstate").html("<h4><span class='blink_text'>Not connected to 192.168.0.31 ..</span></h4>");
	
 }

  function go()
 {
  simpleHttpRequest("http://192.168.0.31/?-*Execute.(*OscilloPlug)(void)", traite, retrylater);
   
 //simpleHttpRequest("../?-*Execute.(*OscilloPlug)(void)", traite);
 }

  function retrylater()
 {
	  setTimeout('oscope.go()',1000)
	  
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
    onCorrel          : onCorrel,
	traite				: traite,
	go					:go,
	settracetcp			:settracetcp,
	copydata			:copydata,
	readEtatscope		:readEtatscope,
	traiteetatscope		:traiteetatscope
	};
  })();
  


 

  
  /**
   * initialize the oscope
   */
   
   /*
  function onInit() {
    m_canvas  = $("#oscope")[0];
    m_context = m_canvas.getContext("2d");
    // attach resize event
    $(window).resize(onResize);
    onResize();
    onPaint(null);
  }
*/


// start the client application
/*
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

*/



  
function selectElementContents(el) 
{
    // Copy textarea, pre, div, etc.
	if (document.body.createTextRange) {
        // IE 
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.select();
        textRange.execCommand("Copy");     
    }
	else if (window.getSelection && document.createRange) {
        // non-IE
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range); 
        try {  
		    var successful = document.execCommand('copy');  
		    var msg = successful ? 'successful' : 'unsuccessful';  
		    console.log('Copy command was ' + msg);  
		} catch(err) {  
		    console.log('Oops, unable to copy');  
		} 
    }
} // end function selectElementContents(el) 


function make_copy_button(el)
{
	var copy_btn = document.createElement('input');
	copy_btn.type = "button";
	el.parentNode.insertBefore(copy_btn, el.nextSibling);
	copy_btn.onclick = function() { selectElementContents(el); };
	
	if (document.queryCommandSupported("copy") || parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]) >= 42)
	{
		// Copy works with IE 4+, Chrome 42+, Firefox 41+, Opera 29+
		copy_btn.value = "Copy to Clipboard";
	}	
	else
	{
		// Select only for Safari and older Chrome, Firefox and Opera
		copy_btn.value = "Select All (then press CTRL+C to Copy)";
	}
}





$("document").ready(function() {
 	make_copy_button(document.getElementById( "data0")  );

	if (oscope) {
    oscope.init();

	oscope.go()
	oscope.readEtatscope();
	

  }
});
