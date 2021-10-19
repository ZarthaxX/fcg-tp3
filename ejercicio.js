// Completar la implementación de esta clase y el correspondiente vertex shader. 
// No será necesario modificar el fragment shader a menos que, por ejemplo, quieran modificar el color de la curva.
class CurveDrawer 
{
	// Inicialización de los shaders y buffers
	constructor()
	{
		// Creamos el programa webgl con los shaders para los segmentos de recta
		this.prog = InitShaderProgram(curvesVS, curvesFS);
		
		this.cp = [0,0,0,0];
		this.mvp = gl.getUniformLocation(this.prog, 'mvp');
		this.t = gl.getAttribLocatiaon(this.prog, 't');
		this.cp[0] = gl.getUniformLocation(this.prog, 'cp0');
		this.cp[1] = gl.getUniformLocation(this.prog, 'cp1');
		this.cp[2] = gl.getUniformLocation(this.prog, 'cp2');
		this.cp[3] = gl.getUniformLocation(this.prog, 'cp3');

		// Muestreo del parámetro t
		this.steps = 100;
		var tv = [];
		for (let i = 0; i < this.steps; i++) {
			tv.push(i / (this.steps - 1));
		}
		
		this.buffer = gl.createBuffer();
		// Enviamos al buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tv), gl.STATIC_DRAW);
	}

	// Actualización del viewport (se llama al inicializar la web o al cambiar el tamaño de la pantalla)
	setViewport(width, height)
	{
		var trans = [ 
			2 / width, 0, 0, 0,
			0, -2 / height, 0, 0,
			0, 0, 1, 0,
			-1, 1, 0, 1 
		];

		gl.useProgram(this.prog);
		gl.uniformMatrix4fv(this.mvp, false, trans);
	}

	updatePoints(pt)
	{
		gl.useProgram(this.prog);
		
		for (let i = 0; i < 4; i++) {
			var x = pt[i].getAttribute("cx");
			var y = pt[i].getAttribute("cy");
			gl.uniform2f(this.cp[i], x, y);
		}
	}

	draw()
	{
		// Seleccionamos el shader
		gl.useProgram(this.prog);
		
		// Binding del buffer de los parametros de la curva
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		// Habilitamos el atributo 
		gl.vertexAttribPointer(this.t, 1, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.t);
		
		// Dibujamos lineas utilizando primitivas gl.LINE_STRIP 
		gl.drawArrays(gl.LINE_STRIP, 0, this.steps);
	}
}

// Vertex Shader
var curvesVS = `
	attribute float t;
	uniform mat4 mvp;
	uniform vec2 cp0;
	uniform vec2 cp1;
	uniform vec2 cp2;
	uniform vec2 cp3;
	varying float tcolor;

	vec2 bezierCurve() {
		return 
			pow(1.0 - t, 3.0) * cp0 +
			3.0 * pow(1.0 - t, 2.0) * t * cp1 +
			3.0 * (1.0 - t) * pow(t, 2.0) * cp2 +
			pow(t, 3.0) * cp3;
	}

	void main()
	{ 
		vec2 cubicBezier = bezierCurve();
		gl_Position =  mvp * vec4(cubicBezier, 0.0, 1.0);
		tcolor = t;
	}
`;

// Fragment Shader
var curvesFS = `
	precision mediump float;
	varying float tcolor;
	void main()
	{
		gl_FragColor = vec4(tcolor * tcolor, tcolor, 1.0 - tcolor, 1.0);
	}
`;
