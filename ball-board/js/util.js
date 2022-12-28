'use strict'

function createMat(rows, cols) {
    const mat = []
    for (var i = 0; i < rows; i++) {
        const row = []
        for (var j = 0; j < cols; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

function getRandomInt(min, max) {
    var scaleFactor = Math.random()
    var randInt = min + Math.floor((max - min) * scaleFactor)
    return randInt
}