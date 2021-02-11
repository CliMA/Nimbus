// --------------------------------------------------------
// utility class and function used by the box controller
// --------------------------------------------------------

class Vertex {
  constructor (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  static transform (vertex, matrix) {
    return Vertex.fromVec3(matrix.multiply(Vertex.toVec3(vertex)));
  }
  static toVec3 (vertex) {
    return new Vec3([vertex.x, vertex.y, vertex.z]);
  }
  static fromVec3 (vector) {
    return new Vertex(vector.element(0), vector.element(1), vector.element(2));
  }
}

// --------------------------------------------------------
function Vec3(elements) {

	if (elements.length !== 3) {
		throw new Error('Vec3 must have 3 elements');
	}

	this.element = function(i) {

		if (i < 0 || i > 2) {
			throw new Error('i must be in the range 0 - 2');
		}

		return elements[i];
	};

	this.multiply = function(matrix) {

//		if (!(matrix instanceof Mat3)) {
//			throw new Error('matrix must be a Mat3');
//		}

		return matrix.multiply(this);
	}
}




export default Vertex;
