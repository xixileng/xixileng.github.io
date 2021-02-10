//******************************************************************************************
//* Rose-Shaped Parametric Surface, by Paul Nylander, bugman123.com, 3/5/04
//* runtime: 1.5 minutes
//******************************************************************************************

camera{location 0.92*<1.375,-1.625,1.5> look_at <0,0,0.25> right x*image_width/image_height up z sky z}
light_source{0.92*<1.375,-1.625,1.5>,1}

//Basic Functions
#macro square(X) X*X #end
#macro mod2(a,b) #local c=mod(a,b); (c>0?c:c+b) #end // always return positive
#macro hue(h) #local X=mod(6*h,1); #local c=<0,0,0>;
 #switch(mod(floor(6*h),6))
  #case(0) #local c=<1,X,0>; #break
  #case(1) #local c=<1-X,1,0>; #break
  #case(2) #local c=<0,1,X>; #break
  #case(3) #local c=<0,1-X,1>; #break
  #case(4) #local c=<X,0,1>; #break
  #case(5) #local c=<1,0,1-X>; #break
 #end
 c
#end

//Parametric Plotting, function f must be defined before this function can be called
#macro ParametricPlot3D(u1,u2,du, v1,v2,dv) #local imax=int((u2-u1)/du); #local jmax=int((v2-v1)/dv);
 #local Mesh=array[imax+1][jmax+1]; #local i=0;
 #while(i<=imax) #local U=u1+i*du; #local j=0; #while(j<=jmax) #local Mesh[i][j]=f(U,v1+j*dv); #local j=j+1; #end #local i=i+1; #end
 DrawMesh(Mesh)
#end
#macro pt(p) <p.x,p.y,p.z> #end
#macro det3(a,b,c,d,e,f,g,h,i) -c*e*g+b*f*g+c*d*h-a*f*h-b*d*i+a*e*i #end // 3�3 matrix
#macro color_triangle(p1,n1,c1, p2,n2,c2, p3,n3,c3) // adapted from Chris Colefax's triangle mapping macro
 #local nx=p2-p1; #local ny=p3-p1; #local nz=vcross(nx,ny);
 smooth_triangle{p1,n1,p2,n2,p3,n3 texture{
  #if(det3(nx.x,nx.y,nx.z, ny.x,ny.y,ny.z, nz.x,nz.y,nz.z)=0) pigment{rgb c1} #else pigment{
   average pigment_map{
    [1 gradient x color_map{[0 rgbt <0,0,0,0.1>][1 rgbt <3*c2.x,3*c2.y,3*c2.z,0.1>]}]
    [1 gradient y color_map{[0 rgbt <0,0,0,0.1>][1 rgbt <3*c3.x,3*c3.y,3*c3.z,0.1>]}]
    [1 gradient z color_map{[0 rgbt <0,0,0,0.1>][1 rgbt <3*c1.x,3*c1.y,3*c1.z,0.1>]}]
   }
   matrix <1.01,0,1, 0,1.01,1, 0,0,1, -0.002,-0.002,-1>
   matrix <nx.x,nx.y,nx.z, ny.x,ny.y,ny.z, nz.x,nz.y,nz.z, p1.x,p1.y,p1.z>
  } #end
  finish{phong 0.4 phong_size 0.25 specular 0.25 reflection 0.25}
 }}
#end
#macro colorquad(p1,n1,c1, p2,n2,c2, p3,n3,c3, p4,n4,c4)
 #if(vlength(p3-p1)<vlength(p4-p2))
  color_triangle(p1,n1,c1, p2,n2,c2, p3,n3,c3) color_triangle(p1,n1,c1, p3,n3,c3, p4,n4,c4)
 #else
  color_triangle(p1,n1,c1, p2,n2,c2, p4,n4,c4) color_triangle(p2,n2,c2, p3,n3,c3, p4,n4,c4)
 #end
#end
#macro DrawMesh(Mesh)
 #local imax=dimension_size(Mesh,1); #local jmax=dimension_size(Mesh,2); #local normals=array[imax][jmax];
 #local i=0;
 #while(i<imax) #local j=0; #while(j<jmax) #local normals[i][j]=<0,0,0>; #local j=j+1; #end #local i=i+1; #end
 #local i=0;
 #while(i<imax-1) #local j=0; // adapted from Tim Wenclawiak's Make_Normals function
  #while(j<jmax-1)
   #local p0=(Mesh[i][j]+Mesh[i][j+1]+Mesh[i+1][j]+Mesh[i+1][j+1])/4;
   #local N=vcross(pt(Mesh[i+1][j]-p0),pt(Mesh[i+1][j+1]-p0));
   #local E=vcross(pt(Mesh[i+1][j+1]-p0),pt(Mesh[i][j+1]-p0));
   #local S=vcross(pt(Mesh[i][j+1]-p0),pt(Mesh[i][j]-p0));
   #local W=vcross(pt(Mesh[i][j]-p0),pt(Mesh[i+1][j]-p0));
   #local normals[i][j]=normals[i][j]+S+W;
   #local normals[i+1][j]=normals[i+1][j]+N+W;
   #local normals[i][j+1]=normals[i][j+1]+S+E;
   #local normals[i+1][j+1]=normals[i+1][j+1]+N+E;
   #local j=j+1;
  #end
  #local i=i+1;
 #end
 #local i=0;
 #while(i<imax) #local j=0; #while(j<jmax) #local normals[i][j]=vnormalize(normals[i][j]); #local j=j+1; #end #local i=i+1; #end
 #local i=0;
 #while (i<imax-1) #local j=0;
  #while (j<jmax-1)
   colorquad(
    pt(Mesh[i  ][j  ]),normals[i  ][j  ],hue(Mesh[i  ][j  ].t),
    pt(Mesh[i+1][j  ]),normals[i+1][j  ],hue(Mesh[i+1][j  ].t),
    pt(Mesh[i+1][j+1]),normals[i+1][j+1],hue(Mesh[i+1][j+1].t),
    pt(Mesh[i  ][j+1]),normals[i  ][j+1],hue(Mesh[i  ][j+1].t)
   )
   #local j=j+1;
  #end
  #local i=i+1;
 #end
#end                  

//Rose-Shaped Surface Calculations
#declare theta1=-(20/9)*pi; #declare theta2=15*pi; #declare x0=0.7831546645625248;
#macro f(x1,theta)
 #local phi=(pi/2)*exp(-theta/(8*pi));
 #local thetanew=theta;
 #local y1=1.9565284531299512*square(x1)*square(1.2768869870150188*x1-1)*sin(phi);
 #local X=1-square(1.25*square(1-mod2(3.6*theta,2*pi)/pi)-0.25)/2;
 #local r=X*(x1*sin(phi)+y1*cos(phi));
 <r*sin(thetanew),r*cos(thetanew),X*(x1*cos(phi)-y1*sin(phi)),(1-x1)/6>
#end
ParametricPlot3D(0,1,1/24, theta1,theta2,(theta2-theta1)/575)

//Tube
#declare r=0.02; #declare theta=theta1;
#declare gold=texture{pigment{rgb <1.25,0.775,0.375>} finish{brilliance 4 diffuse 0.2 ambient 0.115 specular 1 reflection <0.65,0.56,0.4> metallic 1}}
#while(theta<=theta2) #declare p1=pt(f(1,theta));
 sphere{p1,r texture{gold}} #if(theta>theta1) cylinder{p1,p2,r texture{gold}} #end
 #declare p2=p1; #declare theta=theta+(theta2-theta1)/(4*575);
#end

