// OpenGLApplication.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include <stdlib.h> 
#include "glut.h"
#include "glm.h"
#include "math.h"
#include "tga.h"
#include <gl/gl.h>
#define PI 3.14159265
#define  FENCE  1
#define  HOUSE  2
#define  SKYBOX  0
#define MAX_PARTICLES 3000
#define WCX		640
#define WCY		480

int screen_width=1040;
int screen_height = 680;
bool* keyStates = new bool[256]();
GLMmodel *car, *fwheel, *bwheel, *light, *track,*wheel, *table,*bench,*plant,*table2,*magazine,*chair,*ball,*toy1,*toy2,*toy3,*mill,*millleg,*flag,*pole;
bool  camera = false ; // used to change the camera position 
bool anim = false;
bool carLight = false,porchLight1 = false, porchLight2 = false; // check if the light of the car is on or off 
bool fog = false; // turn the fog on or off 

GLuint carTexture; //variable used for the ID of the car texture
GLuint wheelTexture,cactusTexture;
GLuint skyboxTexture[7]; //variable used for the IDs of the six textures that form the skybox
GLuint terraceTexture[7];//variable used for the IDs of the six textures that form the terrace 
GLuint houseTexture[7];
GLuint trackTexture;
GLuint tableTexture,startTexture,flagTexture;
GLuint chairTexture;
GLuint grillTexture,lightTexture;
GLuint ballTexture, toy1Texture, toy2Texture, toy3Texture;
GLuint magazineTexture,millTexture,milllegTexture;
GLfloat fSkyboxSizeX, fSkyboxSizeY, fSkyboxSizeZ; //skybox size on X, Y and Z axes
GLfloat fenceX, fenceY, fenceZ; //fence size on X, Y and Z axes
GLfloat houseX, houseY, houseZ; //fence size on X, Y and Z axes
GLfloat fTreeSize;
GLfloat fGlobalAngleX, fGlobalAngleY, fGlobalAngleZ; //global rotation angles
GLfloat alpha = 0.0;
GLuint mode ;
int polygonMode;
int zoom = 115;
int up = 165;
double angle = 0, angle2 = 90,angle3 = 0;
float front;
double  val = PI / 180.0;
// camera position 
float eyeX = 0, eyeY =0, eyeZ = -10;
float camX, camY, camZ;

int type =0 ;// used to select the mode for drawing objects

//Car position
double xCar = -18, yCar= 31, zCar = 16;
double frontX , frontZ, backX, backZ;
double carDim = 1,carDim2 = 0.5;




//light 

int intensity = 37;
float lightang = 0.0;
float lightX, lightY, lightZ;
GLfloat mylight_position[]={ 1.0, 250.0, 1.0, 0 };




//equations of the planes on which the shadow is cast
GLfloat fvFloorPlaneEq[4];



//projected shadows matrices
GLfloat fvFloorShadowMat[16];
bool shad = false;

//forward declarations for functions
void PlaneEq(GLfloat plane[4], GLfloat p0[4], GLfloat p1[4], GLfloat p2[4]);
void ComputePlaneEquations();
void ComputeShadowMatrix(GLfloat shadowMat[16], GLfloat plane[4], GLfloat lightPos[4]);
void ComputeShadowMatrices();


GLclampf fogColor[3] = { 0.4, 0.4, 0.4 };
float fogdensity = 0.01;

// for rain 

float slowdown = 2.0;
float velocity = 0.0;
int loop;

int xpos, ypos;




typedef struct {
	// Life
	bool alive;	// is the particle alive?
	float life;	// particle lifespan
	float fade; // decay
	// color
	float red;
	float green;
	float blue;
	// Position/direction
	float xpos;
	float ypos;
	float zpos;
	// Velocity/Direction, only goes down in y dir
	float vel;
	// Gravity
	float gravity;
}particles;

// Paticle System
particles par_sys[MAX_PARTICLES];
bool rain = false;

//used to draw the skybox, terrace or house, depending on the value of the parameter obj

void DrawScene(int obj, GLfloat sizeX, GLfloat sizeY, GLfloat sizeZ, GLuint texture[7])
{
	glEnable(GL_TEXTURE_2D); //enable 2D texturing
	int midX = 30, midZ = 0, midY = 90;

	//////////////////////////////////////////////////////////////////
	// please consult the orientation convention for this skybox    //
	// ("orientation_convention.png" file in the "Textures" folder) //
	//////////////////////////////////////////////////////////////////

	if (obj == 2)
	{
		glTranslatef(160, 0, 0);
		
	}

	

	//negative x plane
	glBindTexture(GL_TEXTURE_2D, texture[1]); //select the current texture
	glBegin(GL_QUADS);
	glTexCoord2f(1, 1); glVertex3f(-sizeX, sizeY, -sizeZ); //assign each corner of the texture to a 3D vertex in the OpenGL scene
	glTexCoord2f(0, 1); glVertex3f(-sizeX, sizeY, sizeZ); //(0,0) is the left lower corner, while (1,1) is the right upper corner of the texture
	glTexCoord2f(0, 0); glVertex3f(-sizeX, obj, sizeZ);
	glTexCoord2f(1, 0); glVertex3f(-sizeX, obj, -sizeZ);
	glEnd();
	

	//negative y plane


		glBindTexture(GL_TEXTURE_2D, texture[0]);
		glBegin(GL_QUADS);
		glTexCoord2f(1, 1); glVertex3f(sizeX, obj, -sizeZ);
		glTexCoord2f(0, 1); glVertex3f(-sizeX, obj, -sizeZ);
		glTexCoord2f(0, 0); glVertex3f(-sizeX, obj, sizeZ);
		glTexCoord2f(1, 0); glVertex3f(sizeX, obj, sizeZ);
		glEnd();
	

if (obj == FENCE && shad == true)
{
	//enable stencil testing
	glEnable(GL_STENCIL_TEST);
	//set the stencil function to keep all data except when depth test fails
	glStencilOp(GL_KEEP, GL_KEEP, GL_REPLACE);

	//set stencil function to allways pass
	//this way the stencil buffer will be 1 in the area where the floor is drawn
	glStencilFunc(GL_ALWAYS, 1, 0);
	//clear the stencil buffer
	glClear(GL_STENCIL_BUFFER_BIT);

	glBindTexture(GL_TEXTURE_2D, texture[0]);
	glBegin(GL_QUADS);
	glTexCoord2f(1, 1); glVertex3f(sizeX, obj, -sizeZ);
	glTexCoord2f(0, 1); glVertex3f(-sizeX, obj, -sizeZ);
	glTexCoord2f(0, 0); glVertex3f(-sizeX, obj, sizeZ);
	glTexCoord2f(1, 0); glVertex3f(sizeX, obj, sizeZ);
	glEnd();
}


	//negative z plane
	glBindTexture(GL_TEXTURE_2D, texture[3]);
	glBegin(GL_QUADS);
	glTexCoord2f(1, 1); glVertex3f(-sizeX, sizeY, sizeZ);
	glTexCoord2f(0, 1); glVertex3f(sizeX, sizeY, sizeZ);
	glTexCoord2f(0, 0); glVertex3f(sizeX, obj, sizeZ);
	glTexCoord2f(1, 0); glVertex3f(-sizeX, obj, sizeZ);
	glEnd();
	if (obj != FENCE)
	{
		//positive x plane
		glBindTexture(GL_TEXTURE_2D, texture[2]);
		glBegin(GL_QUADS);
		glTexCoord2f(1, 1); glVertex3f(sizeX, sizeY, sizeZ);
		glTexCoord2f(0, 1); glVertex3f(sizeX, sizeY, -sizeZ);
		glTexCoord2f(0, 0); glVertex3f(sizeX, obj, -sizeZ);
		glTexCoord2f(1, 0); glVertex3f(sizeX, obj, sizeZ);
		glEnd();
	}


	if (obj == HOUSE)
	{

		// draw roof 
		glBindTexture(GL_TEXTURE_2D, texture[5]);
		glBegin(GL_TRIANGLES);
		glTexCoord2f(1, 1); glVertex3f(-sizeX, sizeY, -sizeZ);
		glTexCoord2f(0, 1); glVertex3f(midX, midY, midZ);
		glTexCoord2f(0, 0); glVertex3f(-sizeX, sizeY, sizeZ);
		glEnd();


		glBegin(GL_TRIANGLES);
		glTexCoord2f(1, 1); glVertex3f(-sizeX, sizeY, -sizeZ);
		glTexCoord2f(0, 1); glVertex3f(midX, midY, midZ);
		glTexCoord2f(0, 0); glVertex3f(sizeX, sizeY, -sizeZ);
		glEnd();

		glBegin(GL_TRIANGLES);
		glTexCoord2f(1, 1); glVertex3f(sizeX, sizeY, sizeZ);
		glTexCoord2f(0, 1); glVertex3f(midX, midY, midZ);
		glTexCoord2f(0, 0); glVertex3f(-sizeX, sizeY, sizeZ);
		glEnd();

		glBegin(GL_TRIANGLES);
		glTexCoord2f(1, 1); glVertex3f(sizeX, sizeY, sizeZ);
		glTexCoord2f(0, 1); glVertex3f(midX, midY, midZ);
		glTexCoord2f(0, 0); glVertex3f(sizeX, sizeY, -sizeZ);
		glEnd();
	}

	if (obj == SKYBOX)
	{

		//positive y plane
		glBindTexture(GL_TEXTURE_2D, texture[5]);
		glBegin(GL_QUADS);
		glTexCoord2f(1, 1); glVertex3f(sizeX, sizeY, sizeZ);
		glTexCoord2f(0, 1); glVertex3f(-sizeX, sizeY, sizeZ);
		glTexCoord2f(0, 0); glVertex3f(-sizeX, sizeY, -sizeZ);
		glTexCoord2f(1, 0); glVertex3f(sizeX, sizeY, -sizeZ);
		glEnd();
	}

	//positive z plane
	glBindTexture(GL_TEXTURE_2D, texture[4]);
	glBegin(GL_QUADS);
	glTexCoord2f(1, 1); glVertex3f(sizeX, sizeY, -sizeZ);
	glTexCoord2f(0, 1); glVertex3f(-sizeX, sizeY, -sizeZ);
	glTexCoord2f(0, 0); glVertex3f(-sizeX, obj, -sizeZ);
	glTexCoord2f(1, 0); glVertex3f(sizeX, obj, -sizeZ);
	glEnd();

	glDisable(GL_TEXTURE_2D); //disable 2D texuring
}

// initialize/Reset Particles - give them their attributes
void initParticles(int i)
{
	par_sys[i].alive = true;
	par_sys[i].life = 1.0;
	par_sys[i].fade = float(rand() % 100) / 1000.0f + 0.003f;

	par_sys[i].xpos = (float)(rand() % 1000) - 400;
	par_sys[i].ypos = 150.0;
	par_sys[i].zpos = (float)(rand() % 1000) - 400;

	par_sys[i].red = 0.5;
	par_sys[i].green = 0.5;
	par_sys[i].blue = 1.0;

	par_sys[i].vel = velocity;
	par_sys[i].gravity = -0.8;//-0.8;

}

//draws particles of rain
void drawRain() {
	float x, y, z;
	for (loop = 0; loop < MAX_PARTICLES; loop = loop + 2) {
		if (par_sys[loop].alive == true) {
			x = par_sys[loop].xpos;
			y = par_sys[loop].ypos;
			z = par_sys[loop].zpos + zoom;

			// Draw particles
			glColor3f(0.5, 0.5, 1.0);
			glBegin(GL_LINES);
			glVertex3f(x, y, z);
			glVertex3f(x, y + 0.5, z);
			glEnd();

			// Update values
			//Move
			// Adjust slowdown for speed!
			par_sys[loop].ypos += par_sys[loop].vel / (slowdown * 1000);
			par_sys[loop].vel += par_sys[loop].gravity;
			// Decay
			par_sys[loop].life -= par_sys[loop].fade;

			if (par_sys[loop].ypos <= -10) {
				par_sys[loop].life = -1.0;
			}
			//Revive 
			if (par_sys[loop].life < 0.0) {
				initParticles(loop);
			}
		}
	}
}


void EnableFog()
{

	glClearColor(fogColor[0], fogColor[1], fogColor[2], 1.0);
	glFogfv(GL_FOG_COLOR, fogColor);
	glFogi(GL_FOG_MODE, GL_EXP);
	glFogf(GL_FOG_DENSITY, fogdensity);
	
} 

// enable or disable the fog, depending on the value of the boolean variable fog 
void changeFog()
{

	if (fog == false)
	{

		glEnable(GL_FOG);
		fog = true;
	}
	else
	{
		glDisable(GL_FOG);
		fog = false;
	}
}

// compute the equation of a plane 

void PlaneEq(GLfloat plane[4], GLfloat p0[4], GLfloat p1[4], GLfloat p2[4])
{
	GLfloat vec0[3], vec1[3];

	vec0[0] = p1[0] - p0[0];
	vec0[1] = p1[1] - p0[1];
	vec0[2] = p1[2] - p0[2];

	vec1[0] = p2[0] - p0[0];
	vec1[1] = p2[1] - p0[1];
	vec1[2] = p2[2] - p0[2];

	plane[0] = vec0[1] * vec1[2] - vec0[2] * vec1[1];
	plane[1] = -(vec0[0] * vec1[2] - vec0[2] * vec1[0]);
	plane[2] = vec0[0] * vec1[1] - vec0[1] * vec1[0];

	plane[3] = -(plane[0] * p0[0] + plane[1] * p0[1] + plane[2] * p0[2]);
}

//Computes the equations of all planes that will have shadow cast on them
void ComputePlaneEquations()
{
	//floor points
	GLfloat fvFloorP0[4] = { fenceX / 2, -fenceY / 2, fenceZ / 2, 1.0 };
	GLfloat fvFloorP1[4] = { fenceX / 2, -fenceY / 2, -fenceZ / 2, 1.0 };
	GLfloat fvFloorP2[4] = { -fenceX / 2, -fenceY / 2, -fenceZ / 2, 1.0 };

	//left wall points
//	GLfloat fvLeftP0[4] = { -szRoomX / 2, -szRoomY / 2, szRoomZ / 2, 1.0 };
	//GLfloat fvLeftlP1[4] = { -szRoomX / 2, -szRoomY / 2, -szRoomZ / 2, 1.0 };
	//GLfloat fvLeftP2[4] = { -szRoomX / 2, szRoomY / 2, -szRoomZ / 2, 1.0 };

	PlaneEq(fvFloorPlaneEq, fvFloorP0, fvFloorP1, fvFloorP2);
	///PlaneEq(fvLeftPlaneEq, fvLeftWallP0, fvLeftWallP1, fvLeftWallP2);
}

//Computes the matrices used to project the shadow on all planes that will have shadows cast on them	
void ComputeShadowMatrices()
{
	ComputeShadowMatrix(fvFloorShadowMat, fvFloorPlaneEq, mylight_position);
	//ComputeShadowMatrix(fvLeftWallShadowMat, fvLeftPlaneEq, mylight_position);
}

//Computes the matrix used to project the shadow on a plane
void ComputeShadowMatrix(GLfloat shadowMat[16], GLfloat plane[4], GLfloat lightPos[4])
{
	GLfloat dotProduct;

	dotProduct = plane[0] * lightPos[0] +
		plane[1] * lightPos[1] +
		plane[2] * lightPos[2] +
		plane[3] * lightPos[3];

	shadowMat[0] = dotProduct - lightPos[0] * plane[0];
	shadowMat[1] = 0.0f - lightPos[1] * plane[0];
	shadowMat[2] = 0.0f - lightPos[2] * plane[0];
	shadowMat[3] = 0.0f - lightPos[3] * plane[0];

	shadowMat[4] = 0.0f - lightPos[0] * plane[1];
	shadowMat[5] = dotProduct - lightPos[1] * plane[1];
	shadowMat[6] = 0.0f - lightPos[2] * plane[1];
	shadowMat[7] = 0.0f - lightPos[3] * plane[1];

	shadowMat[8] = 0.0f - lightPos[0] * plane[2];
	shadowMat[9] = 0.0f - lightPos[1] * plane[2];
	shadowMat[10] = dotProduct - lightPos[2] * plane[2];
	shadowMat[11] = 0.0f - lightPos[3] * plane[2];

	shadowMat[12] = 0.0f - lightPos[0] * plane[3];
	shadowMat[13] = 0.0f - lightPos[1] * plane[3];
	shadowMat[14] = 0.0f - lightPos[2] * plane[3];
	shadowMat[15] = dotProduct - lightPos[3] * plane[3];
}

//set textures, enable lighting, set initial values for variables that define the position of the car, the size of the skybox, terrace and house
void initOpenGL()
{
	glClearColor(0.0f, 0.0f, 0.0f, 0.0f);
	glShadeModel(GL_SMOOTH);
	glViewport(0, 0, screen_width, screen_height);
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	gluPerspective(45.0f, (GLfloat)screen_width/(GLfloat)screen_height, 1.0f, 1000.0f);
	glEnable(GL_DEPTH_TEST);
	glDepthFunc(GL_LEQUAL);
	glPolygonMode(GL_FRONT_AND_BACK, GL_FILL);
	glMatrixMode(GL_MODELVIEW);




	glGenTextures(1, &carTexture);
	loadTGA("Obj/Car/carTex.tga", carTexture);

	glGenTextures(1, &wheelTexture);
	loadTGA("Obj/Car/wheelT.tga", wheelTexture);


	glGenTextures(1, &tableTexture);
	loadTGA("Textures\\wood.tga", tableTexture);

	glGenTextures(1, &chairTexture);
	loadTGA("Textures\\darkWood.tga", chairTexture);

	glGenTextures(1, &startTexture);
	loadTGA("Textures\\start2.tga", startTexture);

	glGenTextures(1, &magazineTexture);
	loadTGA("Textures\\mag.tga", magazineTexture);

	glGenTextures(1, &toy1Texture);
	loadTGA("Textures\\bluebike.tga", toy1Texture);


	glGenTextures(1, &ballTexture);
	loadTGA("Textures\\ball.tga", ballTexture);

	glGenTextures(1, &cactusTexture);
	loadTGA("Textures\\cactus.tga", cactusTexture);


	glGenTextures(1, &flagTexture);
	loadTGA("Textures\\flagt.tga", flagTexture);

	glGenTextures(1, &millTexture);
	loadTGA("Textures\\mill.tga", millTexture);

	glGenTextures(1, &toy1Texture);
	loadTGA("Textures\\teddy.tga", toy1Texture);

	glGenTextures(1, &milllegTexture);
	loadTGA("Textures\\milleg.tga", milllegTexture);

	glGenTextures(1, &lightTexture);
	loadTGA("Textures\\lighttex.tga", lightTexture);


	//generate new texture IDs and load each texture that will be used
	glGenTextures(1, &trackTexture);
	//loadTGA("Obj/trackT2.tga", trackTexture);
	loadTGA("Textures\\asphalt.tga", trackTexture);
	
	

	glGenTextures(6, terraceTexture);
	loadTGA("Textures\\floor.tga", terraceTexture[0]); //negative y plane
	loadTGA("Textures\\fence.tga", terraceTexture[1]); //negative x plane
	loadTGA("Textures\\fence.tga", terraceTexture[2]); //positive x plane
	loadTGA("Textures\\fence.tga", terraceTexture[3]); //negative z plane
	loadTGA("Textures\\fence.tga", terraceTexture[4]); //positive z plane


	glGenTextures(6, houseTexture);
	loadTGA("Textures\\houseSide2.tga", houseTexture[0]); //negative y plane
	loadTGA("Textures\\houseFront.tga", houseTexture[1]); //negative x plane
	loadTGA("Textures\\houseSide2.tga", houseTexture[2]); //positive x plane
	loadTGA("Textures\\houseSide1.tga", houseTexture[3]); //negative z plane
	loadTGA("Textures\\houseSide2.tga", houseTexture[4]); //positive z plane
	loadTGA("Textures\\roof.tga", houseTexture[5]); //positive y plane

	glGenTextures(6, skyboxTexture);
	loadTGA("Textures\\desert-texture.tga", skyboxTexture[0]); //negative y plane
	loadTGA("Textures\\desert-texture3.tga", skyboxTexture[1]); //negative x plane
	loadTGA("Textures\\desert-texture3.tga", skyboxTexture[2]); //positive x plane
	loadTGA("Textures\\desert-texture3.tga", skyboxTexture[3]); //negative z plane
	loadTGA("Textures\\desert-texture3.tga", skyboxTexture[4]); //positive z plane
	loadTGA("Textures\\sky.tga", skyboxTexture[5]); //positive y plane
	
	lightX = 1.0;
	lightY = 250.0;
	lightZ = 1.0;
	

	//set skybox size
	fSkyboxSizeX = 425.0;
	fSkyboxSizeY = 450.0;
	fSkyboxSizeZ = 425.0;

	camX = 0;
	camY = -10;
	camZ = 0;

	fenceX = 80.0;
	fenceY = 30.0;
	fenceZ = 80.0;

	houseX = 80.0;
	houseY = 60.0;
	houseZ = 105.0;

	//
	backX = xCar - 5;
	backZ = zCar;

	for (loop = 0; loop < MAX_PARTICLES; loop++) {
		initParticles(loop);
	}

	ComputePlaneEquations();
	ComputeShadowMatrices();

}

//used for properly importing the information about models from an .obj file
void drawModel(GLMmodel **pmodel, char*filename, GLuint mode){
	if (!*pmodel){
		*pmodel = glmReadOBJ(filename);
		if (!*pmodel)exit(0);w
		glmUnitize(*pmodel);
		//generate facet normal vectors for model
		glmFacetNormals(*pmodel);
		//generate vertex normal vectors (called after generating facet normals)
		glmVertexNormals(*pmodel, 90.0);
		//generate texture 
		glmLinearTexture(*pmodel);
	}
	glmDraw(*pmodel, mode);
}

void keyOperations(void)
{


	if (keyStates['a'])
	{
		if (camera == true ) 
			angle2--;
		else 
			angle--;
		
	}


	if (keyStates['d'])
	{	
		if (camera == true)
			angle2++;
		else
			angle++;
		
	}

	if (keyStates['w'])
	{
		if (camera == true)
		{

			xCar = xCar + 0.1 * sin(angle2*val);
			zCar = zCar + 0.1 * cos(angle2* val);
		}

		else
		{

			camX += 0.5 * cos(angle*val);
			camZ += 0.5 * sin(angle* val);
		}
	}

	if (keyStates['s'])
	{
		
		if (camera == true)
		{
			xCar = xCar - 0.1 * sin(angle2*val);
			zCar = zCar - 0.1 * cos(angle2*val);
			//angle2--;
		}
		else
		{
			camX -= 0.5 * cos(angle*val);
			camZ -= 0.5 * sin(angle* val);
		}
		
	}
	
}

// select between viewing solid, wireframe objects, polygonal and smooth surfaces
void polyMode()
{


	switch (polygonMode)
	{
	
	case 0:
		
		glPolygonMode(GL_FRONT_AND_BACK, GL_FILL);
		break;
		// poligon
	case 1:
		glPolygonMode(GL_FRONT_AND_BACK, GL_POINT);
		break;
		//  solid
	case 2:
		glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);
		break;
	case 3:
		glShadeModel(GL_SMOOTH);
		break;
	}
}

GLuint selectMode()
{
	GLuint mode;
	switch (type)
	{
	case 0:

		mode = GLM_SMOOTH | GLM_TEXTURE | GLM_MATERIAL;
		break;
	case 1:
		mode = GLM_SMOOTH | GLM_TEXTURE ;
		
		break;
	case 2:
		mode = GLM_SMOOTH;
		break;

	}

	

	return mode;

}

void drawCar()
{



	glPushMatrix();

		glEnable(GL_TEXTURE_2D);
		glTranslatef(xCar, 25.5, zCar);
		glRotatef(-90, 1, 0, 0);
		glRotatef(angle2, 0, 0, 1);
		glBindTexture(GL_TEXTURE_2D, carTexture);
		drawModel(&car, "OBJ/Car/car5.obj", mode);
		glDisable(GL_TEXTURE_2D);

	glPopMatrix();

}

void drawObj()
{
	glPushMatrix();
	glEnable(GL_TEXTURE_2D);
	glTranslatef(-2, 18, -64);

	glScalef(12, 12, 12);
	glBindTexture(GL_TEXTURE_2D, tableTexture);
	drawModel(&table2, "OBJ/tablemini.obj", mode);
	glDisable(GL_TEXTURE_2D);
	glPopMatrix();


	glPushMatrix();
	glEnable(GL_TEXTURE_2D);
	glTranslatef(-2, 18, 64);

	glScalef(24, 24, 24);
	glBindTexture(GL_TEXTURE_2D, tableTexture);
	drawModel(&bench, "OBJ/bench.obj", mode);
	glDisable(GL_TEXTURE_2D);
	glPopMatrix();

	glPushMatrix();
	glEnable(GL_TEXTURE_2D);
	glTranslatef(34, 18, 65);
	glRotatef(180, 0, 1, 0);
	glScalef(5, 5, 5);
	glBindTexture(GL_TEXTURE_2D, toy1Texture);
	drawModel(&toy1, "OBJ/teddyBear.obj", mode);
	glDisable(GL_TEXTURE_2D);
	glPopMatrix();

	glPushMatrix();
	glEnable(GL_TEXTURE_2D);
	glTranslatef(-40, 30, -75);
	glScalef(5, 5, 5);
	glBindTexture(GL_TEXTURE_2D, lightTexture);
	drawModel(&light, "OBJ/lightFrame.obj", mode);
	glDisable(GL_TEXTURE_2D);
	glPopMatrix();

	glPushMatrix();
	glEnable(GL_TEXTURE_2D);
	glTranslatef(40, 30, -75);
	glScalef(5, 5, 5);
	glBindTexture(GL_TEXTURE_2D, lightTexture);
	drawModel(&light, "OBJ/lightFrame.obj", mode);
	glDisable(GL_TEXTURE_2D);
	glPopMatrix();




	glPushMatrix();
	glEnable(GL_TEXTURE_2D);
	glTranslatef(-2, 30, -64);

	glScalef(8, 8, 8);
	glBindTexture(GL_TEXTURE_2D, magazineTexture);
	drawModel(&magazine, "OBJ/pileMagazines.obj", mode);
	glDisable(GL_TEXTURE_2D);
	glPopMatrix();


	glPushMatrix();
	glEnable(GL_TEXTURE_2D);
	glTranslatef(-25, 10, 0);
	glScalef(65, 65, 65);
	glBindTexture(GL_TEXTURE_2D, tableTexture);
	drawModel(&table, "OBJ/table.obj", mode);
	glDisable(GL_TEXTURE_2D);
	glPopMatrix();

	glPushMatrix();
	glPushMatrix();
	glEnable(GL_TEXTURE_2D);
	glTranslatef(-45, 12, -160);
	glRotatef(90, 1, 0, 0);
	glScalef(65, 65, 65);
	glBindTexture(GL_TEXTURE_2D, tableTexture);
	drawModel(&millleg, "OBJ/millleg.obj", mode);
	glDisable(GL_TEXTURE_2D);
	glPopMatrix();

	glPushMatrix();
	glEnable(GL_TEXTURE_2D);
	glTranslatef(-45, 43.5, -160);
	glRotatef(90, 1, 0, 0);
	glRotatef(angle3, 0, 1, 0);
	glScalef(115, 115, 115);
	glBindTexture(GL_TEXTURE_2D, millTexture);
	drawModel(&mill, "OBJ/mill.obj", mode);
	glDisable(GL_TEXTURE_2D);
	glPopMatrix();
	glPopMatrix();


	glPushMatrix();

	glEnable(GL_TEXTURE_2D);
	glTranslatef(-16, 26, 13);

	//glBindTexture(GL_TEXTURE_2D, poleTexture);
	drawModel(&pole, "OBJ/pole.obj", mode);
	glDisable(GL_TEXTURE_2D);

	glPushMatrix();
	glEnable(GL_TEXTURE_2D);
	glTranslatef(0, 0.7, 0.4);
	glScalef(1.3, 1.3, 1.3);
	glBindTexture(GL_TEXTURE_2D, flagTexture);
	drawModel(&flag, "OBJ/flag.obj", mode);
	glDisable(GL_TEXTURE_2D);
	glPopMatrix();

	glPopMatrix();

	glPushMatrix();

	glEnable(GL_TEXTURE_2D);
	glTranslatef(-16, 25.15, 16);
	glRotatef(90, 0, 0, 1);
	glScalef(1, 5.6, 5.6);
	glBindTexture(GL_TEXTURE_2D, startTexture);
	drawModel(&flag, "OBJ/flag.obj", mode);
	glDisable(GL_TEXTURE_2D);
	glPopMatrix();

	glPopMatrix();



	glPushMatrix();
	glEnable(GL_TEXTURE_2D);
	glTranslatef(-23, 25.2, 0);
	glScalef(15, 25, 45);
	glBindTexture(GL_TEXTURE_2D, trackTexture);
	drawModel(&track, "OBJ/track10.obj", mode);
	glDisable(GL_TEXTURE_2D);
	glPopMatrix();

	
	glPushMatrix();
	glEnable(GL_TEXTURE_2D);
	glTranslatef(-25, 20, -65);

	glScalef(15, 15, 15);
	glBindTexture(GL_TEXTURE_2D, chairTexture);
	drawModel(&chair, "OBJ/chair.obj", mode);
	glDisable(GL_TEXTURE_2D);
	glPopMatrix();

	glPushMatrix();
	glEnable(GL_TEXTURE_2D);
	glTranslatef(15, 20, -65);
	glScalef(15, 15, 15);
	glBindTexture(GL_TEXTURE_2D, chairTexture);
	drawModel(&chair, "OBJ/chair.obj", mode);
	glDisable(GL_TEXTURE_2D);
	glPopMatrix();

	glPushMatrix();
	glEnable(GL_TEXTURE_2D);
	glTranslatef(15, 10, 25);
	glScalef(35, 35, 35);
	glBindTexture(GL_TEXTURE_2D, ballTexture);
	drawModel(&ball, "OBJ/sphere.obj", mode);
	glDisable(GL_TEXTURE_2D);
	glPopMatrix();


}

void drawShadow()
{


	glPushMatrix();
		glTranslatef(-22, 20, -65);
		glScalef(15, 15, 15);
		drawModel(&chair, "OBJ/chair.obj", mode);
	glPopMatrix();

	glPushMatrix();
		glTranslatef(22, 20, -65);
		glScalef(15, 15, 15);
		drawModel(&chair, "OBJ/chair.obj", mode);
	glPopMatrix();

	glPushMatrix();
		glTranslatef(25, 10, 25);
		glScalef(35, 35, 35);
		drawModel(&ball, "OBJ/sphere.obj", mode);
	glPopMatrix();


}

void drawCactus()
{

	glPushMatrix();

		glEnable(GL_TEXTURE_2D);
		glTranslatef(-15, 12, 150);
		glScalef(10.3, 10.3, 10.3);
		glBindTexture(GL_TEXTURE_2D, cactusTexture);
		drawModel(&plant, "OBJ/cactus3.obj", mode);
		glDisable(GL_TEXTURE_2D);

	glPopMatrix();


	glPushMatrix();

	glEnable(GL_TEXTURE_2D);
	glTranslatef(-9, 12, -190);
	glScalef(10.3, 10.3, 5.3);
	glBindTexture(GL_TEXTURE_2D, cactusTexture);
	drawModel(&plant, "OBJ/cactus2.obj", mode);
	glDisable(GL_TEXTURE_2D);

	glPopMatrix();

	glPushMatrix();

		glEnable(GL_TEXTURE_2D);
		glTranslatef(-25, 12, -190);
		glScalef(5.3, 20.3, 2.3);
		glBindTexture(GL_TEXTURE_2D, cactusTexture);
		drawModel(&plant, "OBJ/cactus3.obj", mode);
		glDisable(GL_TEXTURE_2D);
	glPopMatrix();

	glPushMatrix();

		glEnable(GL_TEXTURE_2D);
		glTranslatef(-175, 12, 130);
		glScalef(5.3, 20.3, 2.3);
		glBindTexture(GL_TEXTURE_2D, cactusTexture);
		drawModel(&plant, "OBJ/cactus3.obj", mode);
		glDisable(GL_TEXTURE_2D);

	glPopMatrix();


	glPushMatrix();

		glEnable(GL_TEXTURE_2D);
		glTranslatef(-225, 12, -300);
		glScalef(5.3, 20.3, 8.3);
		glBindTexture(GL_TEXTURE_2D, cactusTexture);
		drawModel(&plant, "OBJ/cactus3.obj", mode);
		glDisable(GL_TEXTURE_2D);

	glPopMatrix();

	

}

void animateCamera()
{
	
	
	if (up > 80) up--;
	else
	{ 
		if (zoom < 115) zoom++;
		else 
		if (camZ > -40) camZ--;
		else anim = false;
	
	}

}




void renderScene(void)
{
	keyOperations();
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glLoadIdentity();

	if (camera == true)  gluLookAt(xCar - 5 * sin(angle2*val), 26, zCar - 5 * cos(angle2*val), xCar, 25, zCar, 0.0, 1.0, 0.0);
	else
	{
		if (camera == false )
		{

			glRotatef(angle, 0, 1, 1);
			gluLookAt(0.0, up, zoom, camX, camY, camZ, 0.0, 1.0, 0.0);
		}
		
	}

	
	if (rain == true) drawRain();

	polyMode();

	GLfloat mylight_ambient[] = { 0.1, 0.1, 0.1, 0.1 };
	GLfloat mylight_diffuse[] = { 0.1 * intensity, 0.1 * intensity, 0.1 * intensity, 1};
	GLfloat mylight_specular[] = { 1.0, 1.0, 1.0, 1.0 };
	mylight_position[0] = lightX;

	GLfloat carlight_ambient[] = { 0.1, 0.1, 0.1, 0.1 };
	GLfloat carlight_diffuse[] = { 1.0, 1.0, 0.0, 1.0 };
	GLfloat carlight_specular[] = { 1.0, 1.0, 1.0, 1.0 };
	GLfloat carlight_position[] = { xCar + 0.5 * sin(angle2*val), 2, zCar +  cos(angle2*val), 1 };
	GLfloat spotDir[] = { sin(angle2*val), 0, cos(angle2*val) };
	GLfloat  spotCutoff[] = { 45.0 };

	GLfloat porchlight_ambient[] = { 0.1, 0.1, 0.1, 0.1 };
	GLfloat porchlight_diffuse[] = { 20.0 , 20.0, 0.0, 1.0 };
	GLfloat porchlight_specular[] = { 1.0, 1.0, 1.0, 1.0 };
	GLfloat porchlight1_position[] = { -40, 30, -75, 1 };
	GLfloat porchlight2_position[] = {40, 30, -75, 1 };
	GLfloat spotDir2[] = { 0, -1, 0 };
	GLfloat  spotCutoff2[] = { 60.0 };
	

	

	glEnable(GL_LIGHTING);
	glEnable(GL_LIGHT0);
	

	EnableFog();

	glLightfv(GL_LIGHT0, GL_AMBIENT, mylight_ambient);
	glLightfv(GL_LIGHT0, GL_DIFFUSE, mylight_diffuse);
	glLightfv(GL_LIGHT0, GL_SPECULAR, mylight_specular);
	glLightfv(GL_LIGHT1, GL_POSITION, mylight_position);


	glLightfv(GL_LIGHT1, GL_AMBIENT, carlight_ambient);
	glLightfv(GL_LIGHT1, GL_DIFFUSE, carlight_diffuse);
	glLightfv(GL_LIGHT1, GL_SPECULAR, carlight_specular);
	glLightfv(GL_LIGHT1, GL_POSITION, carlight_position);
	glLightfv(GL_LIGHT1, GL_SPOT_DIRECTION, spotDir);
	glLightfv(GL_LIGHT1, GL_SPOT_CUTOFF,spotCutoff);
	glLightf(GL_LIGHT1, GL_SPOT_EXPONENT, 2.0);

	glLightfv(GL_LIGHT2, GL_AMBIENT, porchlight_ambient);
	glLightfv(GL_LIGHT2, GL_DIFFUSE, porchlight_diffuse);
	glLightfv(GL_LIGHT2, GL_SPECULAR, porchlight_specular);
	glLightfv(GL_LIGHT2, GL_POSITION, porchlight1_position);
	glLightfv(GL_LIGHT2, GL_SPOT_DIRECTION, spotDir2);
	glLightfv(GL_LIGHT2, GL_SPOT_CUTOFF, spotCutoff2);
	glLightf(GL_LIGHT2, GL_SPOT_EXPONENT, 2.0);

	glLightfv(GL_LIGHT3, GL_AMBIENT, porchlight_ambient);
	glLightfv(GL_LIGHT3, GL_DIFFUSE, porchlight_diffuse);
	glLightfv(GL_LIGHT3, GL_SPECULAR, porchlight_specular);
	glLightfv(GL_LIGHT3, GL_POSITION, porchlight2_position);
	glLightfv(GL_LIGHT3, GL_SPOT_DIRECTION, spotDir2);
	glLightfv(GL_LIGHT3, GL_SPOT_CUTOFF, spotCutoff2);
	glLightf(GL_LIGHT3, GL_SPOT_EXPONENT, 2.0);

	 mode = selectMode();
	 if (anim == true) animateCamera();


	glPushMatrix();
		DrawScene(0,fSkyboxSizeX, fSkyboxSizeY, fSkyboxSizeZ,skyboxTexture);
	glPopMatrix();

	glPushMatrix();
		DrawScene(1,fenceX, fenceY, fenceZ,terraceTexture);
	glPopMatrix();

	glPushMatrix();
		DrawScene(2, houseX, houseY, houseZ, houseTexture);
	glPopMatrix();


	if (shad == true)
	{

		//set the stencil function to pass only when the stencil buffer is 1
		//this way the shadow will appear only on the surface previously drawn
		glStencilFunc(GL_EQUAL, 1, 1);
		//disable depth testing for the shadow
		glDisable(GL_DEPTH_TEST);
		//disable lighting, in order to have a black shadow
		glDisable(GL_LIGHTING);

		//floor shadow	
		glColor4f(0.01f, 0.01f, 0.01f,0.9f);//set the shadow color
		glPushMatrix();
		//project onto the floor
		glMultMatrixf(fvFloorShadowMat);
		//glRotatef(180, 0.0,1.0, 0.0);
		//draw the shadow
		drawShadow();
		glPopMatrix();

		//disable stencil testing
		//we only need stencil testing when we draw shadows and shadowed planes
		glDisable(GL_STENCIL_TEST);
		glEnable(GL_DEPTH_TEST);
		//enable lighting
		glEnable(GL_LIGHTING);

	}


	drawObj();
	drawCactus();
	drawCar();

	angle3 += 0.3;
	glutSwapBuffers();
}

void changeSize(int w, int h)
{
	screen_width=w;
	screen_height=h;

	if(h == 0)
		h = 1;

	float ratio = 1.0*w/h;

	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	glViewport(0, 0, w, h);
	gluPerspective(45.0f, ratio, 1.0f, 1000.0f);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	gluLookAt(0.0f, 0.0f, 50.0f, 0.0f, 0.0f, -1.0f, 0.0f, 1.0f, 0.0f);
}

void processNormalKeys(unsigned char key, int x, int y)
{

	keyStates[key] = true;


	switch (key)
	{
	case 'c':
		if (camera == true) camera = false;
		else camera = true ;
		break;
	case 'h':
		zoom--;
		break;
	case 'j':
		if (zoom <= fSkyboxSizeZ - 5) zoom++;
		break;
	case 'k':
		if (up < fSkyboxSizeY - 5) 	up++;
		break;
	case 'l':
		if (up > 5) up--;
		break;
	case 'f':
		changeFog();
		break;
	case 'b':
		intensity++;
		break;
	case 'n':
		intensity--;
		break;
	case 'p':
		//fogColor[0] -= 0.01;
		//fogColor[1] -= 0.01;
		//fogColor[2] -= 0.01;
		fogdensity -= 0.1;
		break;
	case 'o':
	//	fogColor[0] += 0.01;
		//fogColor[1] += 0.01;
		//fogColor[2] += 0.01;
		fogdensity += 0.1;
		break;
	case 'i':
		alpha += 0.1;
		break;
	case 'u':
		alpha -= 0.1;
		break;

	case '1':
		if (carLight == false)
			{
				glEnable(GL_LIGHT1);
				carLight = true;
			}
			else
			{
				glDisable(GL_LIGHT1);
				carLight = false;
			}
		break;

	case '2':
		if (porchLight1 == false)
		{
			glEnable(GL_LIGHT2);
			porchLight1 = true;
		}
		else
		{
			glDisable(GL_LIGHT2);
			porchLight1 = false;
		}
		break;

	case '3':
		if (porchLight2 == false)
		{
			glEnable(GL_LIGHT3);
			porchLight2 = true;
		}
		else
		{
			glDisable(GL_LIGHT3);
			porchLight2 = false;
		}
	
		break;

	case '4':
		if (polygonMode == 3) polygonMode = 0;
		else polygonMode++;
		break;

	case '5':
		if (rain == false) rain  = true;
		else rain = false;
		break;
	case '6':
		if (anim == false)
		{
			anim = true;
			up = 450;
			zoom = 20;
			camX = 0; camY = 0; camZ = 0;
		}
		else
		{
			anim = false;
			up = 165;
			zoom = 115;
			camX = 0; camY = -10; camZ = 0;
		}
		break;




	case 'v':
		if (type == 2) type = 0;
			else type++;
		break;

	case '7':
		if (shad == false) shad = true;
		else shad = false;
		break;
		
	case '8':
		if (lightX <fSkyboxSizeX - 5) lightX++;
	case '9':
		if (lightX > - fSkyboxSizeX + 5) lightX--;
	}

}

void keyUp(unsigned char key, int x, int y) 
{
	keyStates[key] = false;
}


int main(int argc, char* argv[])
{
	//Initialize the GLUT library
	glutInit(&argc, argv);
	//Set the display mode
	glutInitDisplayMode(GLUT_DEPTH | GLUT_DOUBLE | GLUT_RGBA);
	//Set the initial position and dimensions of the window
	glutInitWindowPosition(100, 100);
	glutInitWindowSize(screen_width, screen_height);
	//creates the window
	glutCreateWindow("First OpenGL Application");
	//Specifies the function to call when the window needs to be redisplayed
	glutDisplayFunc(renderScene);
	//Sets the idle callback function
	glutIdleFunc(renderScene);
	//Sets the reshape callback function
	glutReshapeFunc(changeSize);
	//Keyboard callback function
	glutKeyboardFunc(processNormalKeys);
	//method used for key up events
	glutKeyboardUpFunc(keyUp);
	//Initialize some OpenGL parameters
	initOpenGL();
	//Starts the GLUT infinite loop
	glutMainLoop();
	return 0;
}

