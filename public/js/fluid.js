const state = {
    x: new Float32Array(PARTICLE_COUNT), // x location
    y: new Float32Array(PARTICLE_COUNT), // y location
    oldX: new Float32Array(PARTICLE_COUNT), // previous x location
    oldY: new Float32Array(PARTICLE_COUNT), // previous y location
    vx: new Float32Array(PARTICLE_COUNT), // horizontal velocity
    vy: new Float32Array(PARTICLE_COUNT), // vertical velocity
    p: new Float32Array(PARTICLE_COUNT), // pressure
    pNear: new Float32Array(PARTICLE_COUNT), // pressure near
    g: new Float32Array(PARTICLE_COUNT), // 'nearness' to neighbour
    mesh: [] // Three.js mesh for rendering
};

// Pass 1

for (let i = 0; i < PARTICLE_COUNT; i++) {

    // Update old position
    state.oldX[i] = state.x[i];
    state.oldY[i] = state.y[i];
    applyGlobalForces(i, dt);

    // Update positions
    state.x[i] += state.vx[i] * dt;
    state.y[i] += state.vy[i] * dt;

    // Update hashmap
    const gridX = (state.x[i] / canvasRect.w + 0.5) * GRID_CELLS;
    const gridY = (state.y[i] / canvasRect.h + 0.5) * GRID_CELLS;
    hashMap.add(gridX, gridY, i);

} 

const applyGlobalForces = (i, dt) => {
    const force = GRAVITY;
    state.vx[i] += force[0] * dt;
    state.vy[i] += force[1] * dt;
}; 

const index = Math.round(cellX) + Math.round(cellY) * gridCellsInRow

const gridX = (state.x[i] / canvasRect.w + 0.5) * GRID_CELLS;
const gridY = (state.y[i] / canvasRect.h + 0.5) * GRID_CELLS; 

// Pass 2

for (let i = 0; i < PARTICLE_COUNT; i++) {

    const neighbours = getNeighboursWithGradients(i);
    updateDensities(i, neighbours);

    // perform double density relaxation
    relax(i, neighbours, dt);

} 

const getNeighboursWithGradients = i => {
  
    const gridX = (state.x[i] / canvasRect.w + 0.5) * GRID_CELLS;
    const gridY = (state.y[i] / canvasRect.h + 0.5) * GRID_CELLS;
    const radius = (INTERACTION_RADIUS / canvasRect.w) * GRID_CELLS;

    const results = hashMap.query(gridX, gridY, radius);
    const neighbours = [];

    for (let k = 0; k < results.length; k++) {

        const n = results[k];
        if (i === n) continue; // Skip itself

        const g = gradient(i, n);
        if (g === 0) continue

        state.g[n] = g; // Store the gradient
        neighbours.push(n); // Push the neighbour to neighbours

    }

    return neighbours;

};

const gradient = (i, n) => {

    const particle = [state.x[i], state.y[i]]; // position of i
    const neighbour = [state.x[n], state.y[n]]; // position of n
  
    const lsq = lengthSq(subtract(particle, neighbour));
    if (lsq > INTERACTION_RADIUS_SQ) return 0;

    const distance = Math.sqrt(lsq)
    return 1 - distance / INTERACTION_RADIUS;

};

const updatePressure = (i, neighbours) => {

    let density = 0;
    let nearDensity = 0;

    for (let k = 0; k < neighbours.length; k++) {
        const g = state.g[neighbours[k]]; // Get g for this neighbour
        density += g * g;
        nearDensity += g * g * g;
    }

    state.p[i] = STIFFNESS * (density - REST_DENSITY);
    state.pNear[i] = STIFFNESS_NEAR * nearDensity;

};

const relax = (i, neighbours, dt) => {
  
    const pos = [state.x[i], state.y[i]];
  
    for (let k = 0; k < neighbours.length; k++) {
        const n = neighbours[k];
        const g = state.g[n];

        const nPos = [state.x[n], state.y[n]];
        const magnitude = state.p[i] * g + state.pNear[i] * g * g;

        const direction = unitApprox(subtract(nPos, pos))
        const force = multiplyScalar(direction, magnitude);

        const d = multiplyScalar(force, dt * dt);

        state.x[i] += d[0] * -.5;
        state.y[i] += d[1] * -.5;

        state.x[n] += d[0] * .5;
        state.y[n] += d[1] * .5;
    }

};

// Pass 3

for (let i = 0; i < PARTICLE_COUNT; i++) {

    // Constrain the particles to a container
    contain(i, dt);

    // Calculate new velocities
    calculateVelocity(i, dt);

    // Update
    state.mesh[i].position.set(state.x[i], state.y[i], 0);

}

const contain = i => {

    const pos = [state.x[i], state.y[i]];

    if (lengthSq(pos) > canvasRect.radiusSq) {
    
        const unitPos = unit(pos)
        const newPos = multiplyScalar(clone(unitPos), canvasRect.radius)
    
        state.x[i] = newPos[0]
        state.y[i] = newPos[1]

    }

}

const calculateVelocity = (i, dt) => {

    const pos = [state.x[i], state.y[i]];
    const old = [state.oldX[i], state.oldY[i]];

    const v = multiplyScalar(subtract(pos, old), 1 / dt);

    state.vx[i] = v[0];
    state.vy[i] = v[1];

};

const contain = (i, dt) => {

    const pos = [state.x[i], state.y[i]];
  
    if (lengthSq(pos) > canvasRect.radiusSq) {
    
        const unitPos = unit(pos)
        const newPos = multiplyScalar(clone(unitPos), canvasRect.radius)

        state.x[i] = newPos[0]
        state.y[i] = newPos[1]

        const antiStick = multiplyScalar(
            unitPos, 
            INTERACTION_RADIUS * dt
        )

        state.oldX[i] += antiStick[0]
        state.oldY[i] += antiStick[1]

    }

};