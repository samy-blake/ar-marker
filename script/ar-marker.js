"use strict";

let url = new URL (window.location);
let searchParams = new URLSearchParams(url.search);
let context = searchParams.get('show');
let cont_main = document.getElementById("main");
let cont_cam = document.getElementById("camera");

let renderer,
    scene,
    camera,
    container;

let arSource,
    arContext,markerControls,
    arMarker = [];

let mesh, i;
let patternArray = ["hiro", "dele", "dele_qr"];
let colorArray   = [0xff0000, 0x0066cc, 0xffff00];
let loader, texture, geometry, material;

window.onload = function () {
    if (context && Object.prototype.toString.call(context) === '[object String]' && context === 'camera') {
        cont_main.style.display = "none";
        cont_cam.style.display = "block";
        // background-color for html,body set by css to whitesmoke; this will lay over video/canvas, so:
        document.body.style.backgroundColor = "transparent";
        init();
    }
};

function init(){
    container = cont_cam;

    scene = new THREE.Scene();
    let ambientLight = new THREE.AmbientLight( 0xcccccc, 0.5 );
    scene.add( ambientLight );

    camera = new THREE.Camera();
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';
    container.appendChild(renderer.domElement);

    scene.visible = false;


    ////////////////////////////////////////////////////////////
    // setup arToolkitContext
    ////////////////////////////////////////////////////////////
    // create atToolkitContext
    arContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: './model/camera_para.dat',
        detectionMode: 'mono',
    });

    // copy projection matrix to camera when initialization complete
    arContext.init(function onCompleted(){
        camera.projectionMatrix.copy(arContext.getProjectionMatrix());
    });




    ////////////////////////////////////////////////////////////
    // setup markerRoots
    ////////////////////////////////////////////////////////////
    // build markerControls
    for (i = 0; i < 3; i++)
    {
        let markerRoot = new THREE.Group();
        let markerControls = new THREEx.ArMarkerControls(arContext, markerRoot, {
            type : 'pattern',
            patternUrl : "./marker/" + patternArray[i] + ".patt",
        });

        if (i==1) {
            loader = new THREE.TextureLoader();
            texture = loader.load( 'images/96.png' );
            geometry = new THREE.PlaneBufferGeometry(1, 1, 4, 4);
            material = new THREE.MeshBasicMaterial({map:texture, transparent: false, opacity: 1});
        } else {
            geometry = new THREE.CubeGeometry(1.25, 1.25, 1.25);
            material = new THREE.MeshBasicMaterial({color: colorArray[i], transparent: true, opacity: 0.5});
        }
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 1.25/2;
        markerRoot.add( mesh );
        scene.add(markerRoot);
    }




    arSource = new THREEx.ArToolkitSource({
        sourceType : 'webcam',
    });

    /* handle */
    arSource.init(function(){
        arSource.onResize();
        arSource.copySizeTo(renderer.domElement);

        if(arContext.arController !== null) arSource.copySizeTo(arContext.arController.canvas);

    });


    render();
}




function render(){
    requestAnimationFrame(render);
    renderer.render(scene,camera);

    if(arSource.ready === false) return;

    arContext.update(arSource.domElement);
    scene.visible = camera.visible;


    // mesh.rotateX(.1);

}
