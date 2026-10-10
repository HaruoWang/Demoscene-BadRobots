const float PI = acos(-1.0);
const float TAU = PI * 2.0;
uniform vec2 iResolution;
uniform float iTime;

float hash12(vec2 p)
{
    vec3 p3 = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

mat2 rot(float a)
{
    return mat2(
        cos(a), sin(a),
       -sin(a), cos(a)
    );
}

void main()
{
    vec2 I = gl_FragCoord.xy;
    vec2 uv = I / iResolution;
    vec2 asp = iResolution / min(iResolution.x, iResolution.y);
    vec2 p = (uv * 2.0 - 1.0) * asp;

    float r = max(length(p), 0.01);

    vec2 pt = vec2(log(r), atan(p.y, p.x));
    float SCALE = 24.0 / TAU;
    pt *= SCALE;
    pt.y += pt.x * 1.0; 

    float zoom = iTime;
    pt.x -= zoom;

    float ringId = floor(pt.x);
    float ringType = mod(ringId, 3.0);

    vec3 bg;
    if (ringType == 1.0)
    {
        bg = vec3(0.1, 0.3, 1.0);
    }
    else if (ringType == 2.0)
    {
        bg = vec3(1.0, 0.3, 0.1);
    }
    else
    {
        bg = vec3(0.0, 0.0, 0.0);
    }

    float speed = 4.0 * hash12(vec2(ringId, ringId));
    float angle = iTime * speed;
    pt.y += angle;

    vec2 cellId = floor(pt);
    vec2 local = fract(pt) - 0.5;
    float rand = hash12(cellId);

    float RADIUS = 0.3;
    float thickness = 0.05;

    vec2 hp = local;
        hp.y += 0.1;
        hp.y -= sqrt(abs(hp.x)) * 0.5;
        float heartDistance = abs(length(hp) - RADIUS);
        float heart =
            smoothstep(
                thickness + 0.01,
                thickness - 0.01,
                heartDistance
            );

    vec2 xp = local * rot(PI / 4.0);
        float xDistance = max(
            min(abs(xp.x), abs(xp.y)), 
            max(abs(xp.x), abs(xp.y)) - RADIUS
        );
        float x =
            smoothstep(
                thickness + 0.01,
                thickness - 0.01,
                xDistance
            );

    vec2 rp = local;
        vec2 headDistance = abs(rp) - RADIUS;
        float headBoxSDF = max(headDistance.x, headDistance.y);
        float headOutline = abs(headBoxSDF);
        vec2 eyePos = abs(vec2(rp.x, rp.y-0.05))- vec2(0.1, 0.0);
        float eyes = length(eyePos) - 0.05;
        float robotLines =
            smoothstep(
                thickness + 0.01,
                thickness - 0.01,
                headOutline
            );
        float robotEyes =
            smoothstep(
                0.01,
                -0.01,
                eyes
            );
        float robot =
            clamp(
                robotLines + robotEyes,
                0.0,
                1.0
            );

    float shape;
    if (rand < 0.33)
        shape = heart;
    else if (rand < 0.66)
        shape = x;
    else
        shape = robot;

    vec3 col = mix(bg, vec3(1.0), shape);
    gl_FragColor = vec4(col, 1.0);
}