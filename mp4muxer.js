// Elements: parts of a box that hold values.
// They should have a:
// - byteLength
// - value (can be accessed from outside to set/retrieve)
// - store(buffer, offset) -> write the value to a buffer
// - load(buffer, offset) -> read data and store in value

class Empty {
  constructor(size = 0) {
    this.byteLength = size;
  }

  store(buffer, offset) {
    buffer.fill(0, offset, offset + this.byteLength);
    return;
  }

  load(buffer, offset) {
    return;
  }

  print() {
    return;
  }
}

class CharArray {
  constructor(string) {
    this.byteLength = string.length;
    this.value = string;
  }

  store(buffer, offset) {
    for (let i = 0; i < this.byteLength; i += 1) {
      buffer[offset + i] = this.value.charCodeAt(i);
    }
  }

  load(buffer, offset) {
    this.value = buffer.slice(offset, offset + this.byteLength).toString('ascii');
  }
}

class UInt8 {
  constructor(scalar = 0) {
    this.byteLength = 1;
    this.value = scalar;
  }

  store(buffer, offset) {
    buffer.writeUInt8(this.value, offset);
  }

  load(buffer, offset) {
    this.value = buffer.readUInt8(offset);
  }
}

class UInt8Array {
  constructor(array) {
    this.byteLength = value.length;
    this.value = array;
  }

  store(buffer, offset) {
    for (let i = 0; i < this.value.length; ++i) {
      buffer.writeUInt8(this.value[i], offset + i);
    }
  }

  load(buffer, offset) {
    for (let i = 0; i < this.value.length; ++i) {
      this.value[i] = buffer.readUInt8(offset + i);
    }
  }
}

class UInt16BE {
  constructor(scalar = 0) {
    this.byteLength = 2;
    this.value = scalar;
  }

  store(buffer, offset) {
    buffer.writeUInt16BE(this.value, offset);
  }

  load(buffer, offset) {
    this.value = buffer.readUInt16BE(offset);
  }
}

class UInt24BE {
  constructor(scalar = 0) {
    this.byteLength = 3;
    this.value = scalar;
  }

  store(buffer, offset) {
    buffer.writeUInt8((this.value >> 16) & 0xff, offset);
    buffer.writeUInt8((this.value >> 8) & 0xff, offset + 1);
    buffer.writeUInt8((this.value) & 0xff, offset + 2);
  }

  load(buffer, offset) {
    this.value = buffer.readUInt8(offset) << 16;
               + buffer.readUInt8(offset + 1) << 8;
               + buffer.readUInt8(offset + 2);
  }
}

class UInt16BEArray {
  constructor(array) {
    this.byteLength = array.length * 2;
    this.value = array;
  }

  store(buffer, offset) {
    for (let i = 0; i < this.value.length; ++i) {
      buffer.writeUInt16BE(this.value[i], offset + 2 * i);
    }
  }

  load(buffer, offset) {
    for (let i = 0; i < this.value.length; ++i) {
      this.value[i] = buffer.readUInt16BE(offset + 2 * i);
    }
  }
}

class UInt32BE {
  constructor(scalar = 0) {
    this.byteLength = 4;
    this.value = scalar;
  }

  store(buffer, offset) {
    buffer.writeUInt32BE(this.value, offset);
  }

  load(buffer, offset) {
    this.value = buffer.readUInt32BE(offset);
  }
}

class UInt32BEArray {
  constructor(array) {
    this.byteLength = array.length * 4;
    this.value = array;
  }

  store(buffer, offset) {
    for (let i = 0; i < this.value.length; ++i) {
      buffer.writeUInt32BE(this.value[i], offset + 4 * i);
    }
  }

  load(buffer, offset) {
    for (let i = 0; i < this.value.length; ++i) {
      this.value[i] = buffer.readUInt32BE(offset + 4 * i);
    }
  }
}

const BOXSPEC = {
  // File Type Box
  ftyp: {
    container: 'file',
    mandatory: true,
    quantity: 'one',
    box: 'Box',
    body: [
      ['major_brand', CharArray, 'isom'],
      ['minor_version', UInt32BE, 0],
      ['compatible_brands', CharArray, 'mp41'],
    ]
  },
  // Movie Container
  moov: {
    container: 'file',
    mandatory: true,
    quantity: 'one',
    box: 'Box',
  },
  // Movie Data Box
  mdat: {
    container: 'file',
    mandatory: false,
    quantity: 'any',
    box: 'Box',
    body: [],
  },
  // Movie Header Box
  mvhd: {
    container: 'moov',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    body: [
      ['creation_time', UInt32BE, 0],
      ['modification_time', UInt32BE, 0],
      ['timescale', UInt32BE, 1000], // time-scale for entire presentation, default = milliseconds
      ['duration', UInt32BE, 0xffffffff], // length of entire presentation, default = undetermined
      ['rate', UInt32BE, 0x00010000], // fixed point 16.16, preferred playback rate, default = 1.0
      ['volume', UInt16BE, 0x0100], // fixed point 8.8, preferred playback volume, default = 1.0
      ['reserved', Empty, 10],
      ['matrix', UInt32BEArray, [0x00010000, 0, 0, 0, 0x00010000, 0, 0, 0, 0x40000000]], // transformation matrix, default = unity
      ['pre_defined', Empty, 24],
      ['next_track_ID', UInt32BE, 0xffffffff] // next unused track ID, default = unknown
    ],
  },
  // Track Container
  trak: {
    container: 'moov',
    mandatory: true,
    quantity: 'one+',
    box: 'Box',
  },
  // Track Header Box
  tkhd: {
    container: 'trak',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    // Flag values for the track header:
    // 0x000001 Track_enabled: track enabled (otherwise ignored)
    // 0x000002 Track_in_movie: track used in presentation
    // 0x000004 Track_in_preview: used when previewing presentation
    config: {
      'flags': 0x000003 // track enabled and used in presentation
    },
    body: [
      ['creation_time', UInt32BE, 0],
      ['modification_time', UInt32BE, 0],
      ['track_ID', UInt32BE, 1], // Track identifier, cannot be 0
      ['reserved', Empty, 4],
      ['duration', UInt32BE, 0], // Duration of track using timescale of mvhd box
      ['reserved2', Empty, 8],
      ['layer', UInt16BE, 0], // Front-to-back ordering, lower is closer to viewer
      ['alternate_group', UInt16BE, 0], // Possible grouping of tracks
      ['volume', UInt16BE, 0x0100], // Track's relative audio volume 8.8 fixed point
      ['reserved3', Empty, 2],
      ['matrix', UInt32BEArray, [0x00010000, 0, 0, 0, 0x00010000, 0, 0, 0, 0x40000000]],
      ['width', UInt32BE, 0], // Visual presentation width, 16.16 fixed point
      ['height', UInt32BE, 0], // Visual presentation height, 16.16 fixed point
    ]
  },
  // Track Reference Box
  tref: {
    container: 'trak',
    mandatory: false,
    quantity: 'one-',
    box: 'Box',
  },
  // Media Container
  mdia: {
    container: 'trak',
    mandatory: false,
    quantity: 'one',
    box: 'Box',
  },
  // Media Header Box
  mdhd: {
    container: 'mdia',
    mandatory: false,
    quantity: 'one',
    box: 'FullBox',
    body: [
      ['creation_time', UInt32BE, 0],
      ['modification_time', UInt32BE, 0],
      ['timescale', UInt32BE, 1000], // time-scale for entire presentation, default = milliseconds
      ['duration', UInt32BE, 0xffffffff], // length of entire presentation, default = undetermined
      ['language', UInt16BE, 0] // ISO 639-2 lanugage code, three lower-case letters, stored as
    ]
  },
  // Handler Reference Box
  hdlr: {
    container: 'mdia',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    body: [
      ['predefined', UInt32BE, 0],
      ['handler_type', CharArray, 'vide'], // 'vide', 'soun', or 'hint'
      ['reserved', Empty, 12],
      ['name', CharArray, 'VideoHandler\0'],
    ]
  },
  // Media Information Container
  minf: {
    container: 'mdia',
    mandatory: true,
    quantity: 'one',
    box: 'Box',
  },
  // Video Media Header Box
  vmhd: {
    container: 'minf',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    body: [
      ['graphicsmode', UInt16BE, 0], // Composition mode of the video track, 0 = overwrite
      ['opcolor', UInt16BEArray, [0, 0, 0]], // Red green blue, for use by graphics modes
    ]
  },
  // Sound Media Header Box
  smhd: {
    container: 'minf',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    body: [
      ['balance', UInt16BE, 0x0000], // Place mono track in stereo space, 8.8 fixed point, 0 = center, -1.0 = left, 1.0 = right
      ['reserved', UInt16BE],
    ]
  },
  // Data Information Container
  dinf: {
    container: 'minf',
    mandatory: true,
    quantity: 'one',
    box: 'Box',
  },
  // Data Reference Box
  dref: { // When adding elements to this box, update the entry_count value!
    container: 'dinf',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    body: [
      ['entry_count', UInt32BE, 0] // Number of entries.
    ]
  },
  'url ': {
    container: 'dref',
    mandatory: true,
    quantity: 'one+',
    box: 'FullBox',
    // Flag values:
    // 0x000001 Local reference, which means empty URL
    config: {
      'flags': 0x000001
    },
    body: [
      ['location', CharArray, ''],
    ],
  },
  // Sample Table Container
  stbl: {
    container: 'minf',
    mandatory: true,
    quantity: 'one',
    box: 'Box',
  },
  // Decoding Time to Sample Box
  stts: {
    container: 'stbl',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    body: [
      ['entry_count', UInt32BE, 0],
      // For each entry these two elements:
      // ['sample_count', UInt32BE, 0], // Number of consecutive samples with same delta
      // ['sample_delta', UInt32BE, 0], // Delta of each sample
    ]
  },
  stsd: {
    container: 'stbl',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    body: [
      ['entry_count', UInt32BE, 0],
      // For each entry, one of these three boxes depending on the handler:
      // VisualSampleEntry, AudioSampleEntry, HintSampleEntry
    ]
  },
  avc1: {
    container: 'stsd',
    mandatory: false,
    quantity: 'one',
    box: 'Box',
    body: [
      ['reserved', Empty, 6],
      ['data_reference_index', UInt16BE, 1],
      ['pre_defined', UInt16BE, 0],
      ['reserved2', Empty, 16],
      ['pre_defined2', UInt32BEArray, [0, 0, 0]],
      ['width', UInt16BE, 0],
      ['height', UInt16BE, 0],
      ['horizresolution', UInt32BE, 0x00480000],
      ['vertresolution', UInt32BE, 0x00480000],
    ]
  },
  // Sample Size Box
  stsz: {
    container: 'stbl',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    body: [
      ['sample_size', UInt32BE, 0],
      ['sample_count', UInt32BE, 0],
      // For each sample up to sample_count, append an entry_size:
      // ['entry_size', UInt32BE, ],
    ]
  },
  // Sample To Chunk Box
  stsc: {
    container: 'stbl',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    body: [
      ['entry_count', UInt32BE, 0],
      // For each entry up to entry_count, append these elements:
      // ['first_chunk', UInt32BE, ],
      // ['samples_per_chunk', UInt32BE, ],
      // ['samples_description_index', UInt32BE, ],
    ]
  },
  // Chunk Offset Box
  stco: {
    container: 'stbl',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    body: [
      ['entry_count', UInt32BE, 0],
      // For each entry up to entry_count, append an element:
      // ['chunk_offset', UInt32BE, ],
    ]
  },
  // Unknown Box, used for parsing
  '....': {
    box: 'Box',
    body: [],
  },
  // File Box, special box without any headers
  file: {
    box: 'None',
    mandatory: true,
    quantity: 'one',
  }
}

class Header {
  static None() {
    return [];
  }

  static Box(type) {
    return [
      ['size', UInt32BE, 0],
      ['type', CharArray, type]
    ]
  }

  static FullBox(type) {
    return [].concat(
      this.Box(type),
      [
        ['version', UInt8, 0x00],
        ['flags', UInt24BE, 0x000000]
      ]
    );
  }
}

class Box {
  constructor(type, config) {
    this.type = type;
    this.config = config;
    const spec = BOXSPEC[this.type];
    const header = Header[spec.box](this.type);
    const body = spec.body || [];
    if (spec.body === undefined && this.constructor.name !== 'Container') {
      throw new Error('Body missing but not a container box!')
    }

    // Initialize all elements, an element is something with a byteLength
    this.struct = new Map();
    let offset = 0
    for (const [key, Type, value] of [].concat(header, body)) {
      if (this.has(key)) {
        throw new Error('Trying to add existing key');
      }
      const element = new Type(value);
      this.struct.set(key, {offset, element})
      offset += element.byteLength;
    };

    this.byteLength = offset;

    // Set specific default values for a box (e.g. overriding version/flags)
    for (const key in spec.config) {
      if (this.has(key)) {
        this.element(key).value = spec.config[key];
      }
    }

    // Override default value with those in the configuration
    for (const key in this.config) {
      if (this.has(key)) {
        this.element(key).value = config[key];
      }
    }
  }

  element(key) {
    return this.struct.get(key).element;
  }

  set(key, value) {
    this.element(key).value = value;
  }

  get(key) {
    return this.element(key).value;
  }

  offset(key) {
    return this.struct.get(key).offset;
  }

  has(key) {
    return this.struct.has(key);
  }

  add(key, element) {
    if (this.has(key)) {
      throw new Error('Trying to add existing key');
    }
    this.struct.set(key, {offset: this.byteLength, element});
    this.byteLength += element.byteLength;
    return this;
  }

  buffer() {
    const buffer = Buffer.allocUnsafe(this.byteLength);
    this.store(buffer);
    return buffer;
  }

  store(buffer, offset = 0) {
    // Before writing, make sure the size property is set correctly.
    this.set('size', this.byteLength);
    for (const [key, entry] of this.struct) {
      console.log(entry.offset, entry.element);
      entry.element.store(buffer, offset + entry.offset);
    }
  }

  load(buffer, offset = 0) {
    for (const [key, entry] of this.struct) {
      entry.element.load(buffer, offset + entry.offset);
    }
  }

  storeValue(config, buffer, offset = 0) {
    for (const key in config) {
      if (this.has(key)) {
        const entry = this.struct(key);
        entry.element.storeValue(config[key], buffer, offset + entry.offset);
      }
    }
  }

  print(indent = 0) {
    console.log(' '.repeat(indent), `[${this.type}]`);
    for (const [key, entry] of this.struct) {
      const element = entry.element;
      if (element.print) {
        element.print(indent + 2);
      } else {
        console.log(' '.repeat(indent + 2), key, '=', element.value);
      }
    }
  }
}

class Container extends Box {
  constructor(type, ...boxes) {
    super(type);
    this.boxSize = 0;
    this.add(...boxes);
  }

  add(...boxes) {
    for (const box of boxes) {
      super.add(`box_${this.boxSize++}`, box);
    }
    return this;
  }

  parse(data) {
    while (data.byteLength > 0) {
      const type = new CharArray('....');
      type.load(data, 4);
      const spec = BOXSPEC[type.value];
      let box;
      if (spec !== undefined) {
        if (spec.body !== undefined) {
          box = new Box(type.value);
          box.load(data);
        } else {
          box = new Container(type.value);
          box.load(data);
          box.parse(data.slice(box.byteLength, box.get('size')));
        }
      } else {
        box = new Box('....');
        box.load(data);
        box.type = box.get('type');
      }
      this.add(box);
      data = data.slice(box.get('size'));
    }
  }
}

const ftyp = new Box('ftyp');
const moov = new Container('moov');
const mvhd = new Box('mvhd', {duration: 10000});
const trak = new Container('trak');
const tkhd = new Box('tkhd', {flags: 0x000003});
// moov.add(mvhd, trak.add(tkhd));
// console.log(moov);

// const buffer = Buffer.allocUnsafe(ftyp.byteLength + moov.byteLength);
// ftyp.store(buffer, 0);
// moov.store(buffer, ftyp.byteLength);

const fs = require('fs');
//fs.writeFile('test.mp4', buffer);

//console.log('buffer', buffer, buffer.byteLength);

const file = new Container('file');
//file.parse(buffer);
//file.print();

const ex1 = fs.readFileSync('test.mp4');
// console.log(ex1);
file.parse(ex1);
file.print();
