var ROM_NAME = rom.getstring(0x00000020).replace(/[:]/g, " ");

// Create Directories
fs.mkdir("RSPDUMP/");
var directory = "RSPDUMP/" + ROM_NAME.trim().replace(/[:]/g, " ").replace(/[\r\n]/g, "");
fs.mkdir(directory);

var RAM_SIZE = 4 * (1024 * 1024);
var RAM = mem.getblock(0x80000000, RAM_SIZE);

var nextMicrocodeStart = 0;

var signatures = [
  [0x52, 0x53, 0x50, 0x20, 0x53, 0x57], // "RSP SW"
  [0x52, 0x53, 0x50, 0x20, 0x47, 0x66, 0x78] // "RSP Gfx"
];

//events.ondraw(function(){})

//DumpMemoryToFile(directory, "RAM_TEST.bin", 0x80000000, RAM_SIZE);

function main() {
  print("Finding microcode signatures in \"" + ROM_NAME + "\" ...");

  var matches = findMatchesFor2PatternsFast(signatures);
  //console.log(matches);
  
  var foundNoMatches = true;
  
  for(var i = 0; i < signatures.length; i++) {
    for(var j = 0; j < matches[i].length; j++) {
      if(matches[i].length > 0) {
        var matched_addr = 0x80000000 + matches[i][j];
        var signature_name = mem.getstring(matched_addr).replace(/\//g, " ");
        print("Found signature \""+signature_name+"\" at address 0x" + matched_addr.toString(16));
        foundNoMatches = false;
        current_indent+=2;
        findOSTaskStructureFromSignatureLocation(matches[i][j], signature_name + "(" + matched_addr.toString(16)+")");
        current_indent-=2;
      }
    }
  }
  
  if(foundNoMatches) {
    print("Could not find any signatures. Trying a more precise (and slower) function...");
    
    matches = findMatches(signatures[1]); // Try F3DEX/EX2 search.
    if(matches.length > 0){
      for(var i = 0; i < matches.length; i++) {
        var matched_addr = 0x80000000 + matches[i];
        var signature_name = mem.getstring(matched_addr).replace(/\//g, " ");
        print("Found signature \""+signature_name+"\" at address 0x" + matched_addr.toString(16));
        foundNoMatches = false;
        current_indent+=2;
        findOSTaskStructureFromSignatureLocation(ALIGN_8_BYTES(matches[i]), signature_name + "(" + matched_addr.toString(16)+")");
        current_indent-=2;
      }
    }
    
  }
  
  if(foundNoMatches) {
    print("Could not find any signatures at all. :(");
    
    print("Looking for possible overlay table entries...");
    
    var entries = FindOverlayTableEntriesInMemory(0, 4194304);
    
    if(entries.length > 0) {
      print("Found " + entries.length + " possible overlay tables in RAM.");
      findAndDumpMicrocodesFromDataAddressAndMicrocodeSize(entries);
    }
    else
      print("No overlay table entries could be found. :(");
  }
  
  print("Done.");
}

/*************** Functions ***************/

function ALIGN_8_BYTES(value){
  return value & 0xFFFFFFF8;
}

function ALIGN_16_BYTES(value){
  return value & 0xFFFFFFF0;
}

var current_indent = 0;
function print(output) {
  if(current_indent <= 0)
    console.log(output);
  else {
    var indent = new Array(current_indent + 1).join(' ');
    console.log(indent+output);
  }
}

function makeNoFindDirectory(sig_name){
  var sub_dir = (directory + "/" + sig_name).trim().replace(/[:]/g, " ").replace(/[\r\n]/g, "");
  fs.mkdir(sub_dir);
  sub_dir = (directory + "/" + sig_name + "/NoOSTask").trim().replace(/[:]/g, " ").replace(/[\r\n]/g, "");
  fs.mkdir(sub_dir);
  return sub_dir;
}

function readIntFromRAM(address){
  return (RAM[address] << 24) | (RAM[address + 1] << 16) | (RAM[address + 2] << 8) | RAM[address + 3];
}

function readShortFromRAM(address){
  return (RAM[address] << 8) | RAM[address + 1];
}

function readOverlayTableToGetSizeOfMicrocode(start_address){
  var address_offset = 0;
  var ucode_actual_size = 0;
  var end = false;
  while(!end){
    var main_offset = readIntFromRAM(start_address + address_offset);
    var size = readShortFromRAM(start_address + address_offset + 4) + 1;
    var offset = readShortFromRAM(start_address + address_offset + 6);
    
    if((offset > 0x0FFF && offset < 0x2000) && size < 0x1000)
      ucode_actual_size = Math.max(ucode_actual_size, main_offset + size);
    else
      end = true;
    
    address_offset += 8;
  }
  
  return ucode_actual_size;
}

function intToByteArray(val){
  return [
    (val >> 24) & 0xFF,
    (val >> 16) & 0xFF,
    (val >> 8) & 0xFF,
    val & 0xFF
  ];
}

function processF3DEX2(start_address, sig_name) {
  
  var actual_ucode_size = 0;
  var startOfDataCode = ALIGN_16_BYTES(start_address) - 0x130;
  
  var overlayEntries = FindOverlayTableEntriesInMemory(startOfDataCode, startOfDataCode + 0x800);
  
  if(overlayEntries == 0) {
    print("No overlay entries could be found for F3DEX2. :(");
    return;
  }
  else
  {
    for(var i = 0; i < overlayEntries.length; i++){
      actual_ucode_size = Math.max(actual_ucode_size, overlayEntries[i][1]);
    }
  }
  
  var DataLocationMatches = findMatchesFaster(intToByteArray(0x80000000 + startOfDataCode));

  print("Finding OSTask structures...");
  if(DataLocationMatches.length > 0){
    var hasDumpedMicrocode = false;
    for(var i = 0; i < DataLocationMatches.length; i++){
      var osTaskAddress = 0x80000000 + (DataLocationMatches[i] - 0x18);
      var aMatch = mem.u32[osTaskAddress];
      if(aMatch === 1) {
        print("Found OSTask structure at 0x" + (osTaskAddress).toString(16));
        current_indent+=2;
        
        if(!hasDumpedMicrocode) {
          DumpMicrocode(osTaskAddress, actual_ucode_size, sig_name);
          hasDumpedMicrocode = true;
        }
        
        DumpOSTaskStructure(osTaskAddress, sig_name);
        
        current_indent-=2;
        return true;
      }
    }
  } else {
    print("No OSTask structure was found for this signature.");
    current_indent+=2;
    DumpDataToNoFindFolder(0x80000000 + startOfDataCode, sig_name, actual_ucode_size);
    if(nextMicrocodeStart != 0){
      nextMicrocodeStart += actual_ucode_size;
    }
    current_indent-=2;
    return true;
  }
  
  return false;
}

function findOSTaskStructureFromSignatureLocation(sig_location, sig_name) {
 // print(sig_location.toString(16));
  print("Finding overlays table...");
  
  // First find the overlays table.
  var actual_ucode_size = 0;
  var overlays_table_location = 0;
  for(var i = 0; i < 0x100; i++)
  {
    var test_location = sig_location - (i*8);
    var main_offset = readIntFromRAM(test_location);
    
    if(main_offset == 0) {
      var size = readShortFromRAM(test_location + 4) + 1;
      var offset = readShortFromRAM(test_location + 6);
      if((offset > 0x0FFF && offset < 0x2000) && size < 0x1000)
      {
        // Assumption: Overlay table has atleast 2 entries.
        var second_main_offset = readIntFromRAM(test_location + 8);
        var second_size = readShortFromRAM(test_location + 12);
        var second_offset = readShortFromRAM(test_location + 14);
        if((second_offset > 0x0FFF && second_offset < 0x2000) && second_size < 0x1000)
        {
          overlays_table_location = test_location;
          print("Found overlays table at 0x" + (0x80000000 + overlays_table_location).toString(16));
          actual_ucode_size = readOverlayTableToGetSizeOfMicrocode(overlays_table_location);
          break; // don't need to test anymore.
        }
      }
    }
  }
  
  if(overlays_table_location == 0){
    
    // Not over yet. Probably doing a F3DEX2 microcode.
    var isActuallyF3DEX2 = processF3DEX2(sig_location, sig_name);
    
    if(!isActuallyF3DEX2){
      print("Failed. :(");
    }
    
    return;
  }
  
  print("Size of graphics microcode = 0x" + actual_ucode_size.toString(16));
  
  print("Finding OSTask structures...");
  
  var overlays_table_location_pattern = [
    0x80,
    (overlays_table_location >> 16) & 0xFF,
    (overlays_table_location >> 8) & 0xFF,
    overlays_table_location & 0xFF
  ];
  
  //print(overlays_table_location_pattern);
  
  var DataLocationMatches = findMatchesFaster(overlays_table_location_pattern);
  
  var hasDumpedMicrocode = false;
  
  if(DataLocationMatches.length > 0){
    for(var i = 0; i < DataLocationMatches.length; i++){
      var osTaskAddress = 0x80000000 + (DataLocationMatches[i] - 0x18);
      var aMatch = mem.u32[osTaskAddress];
      if(aMatch === 1) {
        print("Found OSTask structure at " + (osTaskAddress).toString(16));
        current_indent+=2;
        if(!hasDumpedMicrocode) {
          DumpMicrocode(osTaskAddress, actual_ucode_size, sig_name);
          hasDumpedMicrocode = true;
        }
        DumpOSTaskStructure(osTaskAddress, sig_name);
        current_indent-=2;
      }
    }
  } else {
    print("No OSTask structure was found for this signature.");
    current_indent+=2;
    DumpDataToNoFindFolder(0x80000000 + overlays_table_location, sig_name, actual_ucode_size);
    if(nextMicrocodeStart != 0){
      nextMicrocodeStart += actual_ucode_size;
    }
    current_indent-=2;
  }
  
}

function DumpDataToNoFindFolder(loc, sig_name, actual_ucode_size){
  var subDir = makeNoFindDirectory(sig_name);
  var filename = "ucode_data_"+loc.toString(16)+".bin";
  var dumpDataPath = subDir + "/" + filename;
  print("Dumping data to \"" + dumpDataPath + "\"");
  DumpMemoryToFile(subDir, filename, loc, 0x800);
  
  if(nextMicrocodeStart != 0) {
    var dumpDataPath = subDir + "/ucode_code_"+nextMicrocodeStart.toString(16)+".bin";
    print("Dumping what is expected to be the actual microcode data located at 0x" + nextMicrocodeStart.toString(16));
    print("to \"" + dumpDataPath + "\"");
    DumpMemoryToFile(subDir, "ucode_code_"+nextMicrocodeStart.toString(16)+".bin", nextMicrocodeStart, actual_ucode_size);
  }
}

function DumpOSTaskStructure(task_address, sig_name) {
  var sub_dir = (directory + "/" + sig_name).trim().replace(/[:]/g, " ").replace(/[\r\n]/g, "");
  fs.mkdir(sub_dir);
  sub_dir = (sub_dir + "/OSTasks");
  fs.mkdir(sub_dir);

  print("Dumping OSTask to \"" + sub_dir + "\"");
  DumpMemoryToFile(sub_dir, "OSTask_"+task_address.toString(16)+".bin", task_address, 0x40);
}

function DumpMicrocode(task_address, ucode_size, sig_name) {
  var ucode_boot_address = task_address + 0x08;
  var ucode_boot_size = mem.u32[task_address + 0x0C];
  var ucode_address = task_address + 0x10;
  var ucode_data_address = task_address + 0x18;
  var ucode_data_size = mem.u32[task_address + 0x1C];
  
  nextMicrocodeStart = mem.u32[ucode_address] + ucode_size;
  if((ucode_size & 0x8) != 0)
    nextMicrocodeStart += 8; // Take 16-byte alignment into account.
  
  var sub_dir = (directory + "/" + sig_name).trim().replace(/[:]/g, " ").replace(/[\r\n]/g, "");
  fs.mkdir(sub_dir);
  //sub_dir = (sub_dir + "/" + task_address.toString(16));
  //fs.mkdir(sub_dir);

  print("Dumping microcode to \"" + sub_dir + "\"");
  DumpMemoryToFile(sub_dir, "ucode_boot.bin", mem.u32[ucode_boot_address], ucode_boot_size);
  DumpMemoryToFile(sub_dir, "ucode.bin", mem.u32[ucode_address], ucode_size);
  DumpMemoryToFile(sub_dir, "ucode_data.bin", mem.u32[ucode_data_address], ucode_data_size);
}

function DumpMemoryToFile(directory, filename, offset, size) {
  filename = directory + "/" + filename;
  
  var RAM = mem.getblock(offset, size);
  var file = fs.open(filename, 'wb');
  fs.write(file, RAM);
  fs.close(file);
}



function DumpMemoryToFileInCurrentDirectory(filename, offset, size) {
  filename = directory + "/" + filename;
  
  var RAM = mem.getblock(offset, size);
  var file = fs.open(filename, 'wb');
  fs.write(file, RAM);
  fs.close(file);
}

function FindOverlayTableEntriesInMemory(start, end){
  var matches = [];
  
  var possibleFind = 0;
  var numEntries = 0;
  var startAddress = 0;
  var totalSize = 0;
  
  // Loop through memory 4 bytes at a time.
  for(var i = start; i < end; i += 4) {
     // Assumption: No microcode will be bigger than 0xFFFF bytes,
     // so the first 2 bytes should always be 0x0000
    if(RAM[i] == 0 && RAM[i + 1] == 0){
      var code_offset = (RAM[i + 2] << 8) | RAM[i + 3];
      var overlay_size = (RAM[i + 4] << 8) | RAM[i + 5];
      if(overlay_size <= 0x1000) { // overlay size cannot be bigger than IMEM.
        var lastNibble = RAM[i + 5] & 0xF;
        if(lastNibble == 0x07 || lastNibble == 0xF) { // overlay size must end with 7 or F.
          var firstNibble = (RAM[i + 6] >> 4) & 0xF;
          if(firstNibble == 0x1) { // Offset range can only be between 0x1000 and 0x1FFF
            numEntries++;
            totalSize = Math.max(totalSize, code_offset + (overlay_size + 1));
            //totalSize += (overlay_size + 1);
            if(possibleFind == 0){
              possibleFind = i;
            } else {
              if(i - possibleFind == 8){
                // Only allow entries that are consecutive
                startAddress = 0x80000000 + possibleFind;
                possibleFind = 1;
              }
            }
            
            i += 4;
            continue;
          }
        }
      }
    }
    
    if(numEntries > 1 && startAddress != 0){
      print("Found "+numEntries+" possible overlay entries at address: 0x" + startAddress.toString(16));
      print("Microcode size = 0x" + totalSize.toString(16));
      matches.push([startAddress, totalSize]);
    }
    
    totalSize = 0;
    startAddress = 0;
    numEntries = 0
    possibleFind = 0;
  }
  
  return matches;
}

function findAndDumpMicrocodesFromDataAddressAndMicrocodeSize(matches){
  var OSTaskAddress = 0;
  var matchWithOSTask = -1;
  
  var breakThisEarly = false;
  
  print("Finding an OSTask structure...");
  current_indent+=2;
  
  // First find OSTask in memory. Assumption: Only one microcode is active with an OSTask structure.
  for(var i = 0; i < matches.length; i++){
    var startAddress = matches[i][0];
    //var ucode_actual_size = matches[i][1];
    
    var location_pattern = [
      0x80,
      (startAddress >> 16) & 0xFF,
      (startAddress >> 8) & 0xFF,
      startAddress & 0xFF
    ];
    
    var DataLocationMatches = findMatchesFaster(location_pattern);
    
    if(DataLocationMatches.length > 0){
      for(var j = 0; j < DataLocationMatches.length; j++){
        var osTaskAddress = 0x80000000 + (DataLocationMatches[j] - 0x18);
        var aMatch = mem.u32[osTaskAddress];
        if(aMatch === 1) {
          print("Found OSTask structure at 0x" + (osTaskAddress).toString(16) + " for data 0x" + startAddress.toString(16));
          matchWithOSTask = i;
          OSTaskAddress = osTaskAddress;
          breakThisEarly = true;
          break;
        }
      }
    } else {
      print("No OSTask structure was found for data 0x" + startAddress.toString(16));
    }
    
    if(breakThisEarly)
      break;
  }
  
  if(OSTaskAddress == 0){
    printf("Could not find any OSTask structures for the microcode :(");
    return;
  }
  current_indent-=2;
  
  // Dump the OSTask structure
  print("Dumping Microcode from the OSTask structure...");
  current_indent+=2;
  DumpMicrocode(OSTaskAddress, matches[matchWithOSTask][1], "NoSignature");
  DumpOSTaskStructure(OSTaskAddress, "NoSignature");
  current_indent-=2;
  
  print("With the assumption that all microcodes are contiguous in memory,");
  print("now dumping the other microcodes without any OSTask structures...");
  current_indent+=2;
  
  // match was at start of list.
  if(matchWithOSTask == 0){
    for(var i = 1; i < matches.length; i++) {
      if(nextMicrocodeStart != 0){
        nextMicrocodeStart += matches[i][1];
        if((nextMicrocodeStart & 0x8) != 0)
          nextMicrocodeStart += 8;
        DumpDataToNoFindFolder(matches[i][0], "NoSignature", matches[i][1]);
      }
      else {
        print("Error: nextMicrocodeStart is 0. (matchWithOSTask == 0)");
        break;
      }
    }
  }
  // match was at end of list.
  else if(matchWithOSTask == matches.length - 1){
    nextMicrocodeStart -= matches[matchWithOSTask][1];
    nextMicrocodeStart = 0x80000000 + ALIGN_16_BYTES(nextMicrocodeStart & 0x7FFFFFFF);
    for(var i = matches.length - 2; i >= 0; i--) {
      if(nextMicrocodeStart != 0){
        nextMicrocodeStart -= matches[i][1];
        nextMicrocodeStart = 0x80000000 + ALIGN_16_BYTES(nextMicrocodeStart & 0x7FFFFFFF);
        DumpDataToNoFindFolder(matches[i][0], "NoSignature", matches[i][1]);
      }
      else {
        print("Error: nextMicrocodeStart is 0. (matchWithOSTask == matches.length - 1)");
        break;
      }
    }
  }
  else // match was in the middle.
  {
    var savedNextMicrocodeStart = nextMicrocodeStart;
    //print("Not currently supported :(");
    nextMicrocodeStart -= matches[matchWithOSTask][1];
    nextMicrocodeStart = 0x80000000 + ALIGN_16_BYTES(nextMicrocodeStart & 0x7FFFFFFF);
    for(var i = matchWithOSTask - 1; i >= 0; i--) {
      if(nextMicrocodeStart != 0){
        nextMicrocodeStart -= matches[i][1];
        nextMicrocodeStart = 0x80000000 + ALIGN_16_BYTES(nextMicrocodeStart & 0x7FFFFFFF);
        DumpDataToNoFindFolder(matches[i][0], "NoSignature", matches[i][1]);
      }
      else {
        print("Error: nextMicrocodeStart is 0. (matchWithOSTask == matches.length - 1)");
        break;
      }
    }
    
    nextMicrocodeStart = savedNextMicrocodeStart;
    for(var i = matchWithOSTask + 1; i < matches.length; i++) {
      if(nextMicrocodeStart != 0){
        nextMicrocodeStart += matches[i][1];
        if((nextMicrocodeStart & 0x8) != 0)
          nextMicrocodeStart += 8;
        DumpDataToNoFindFolder(matches[i][0], "NoSignature", matches[i][1]);
      }
      else {
        print("Error: nextMicrocodeStart is 0. (matchWithOSTask == 0)");
        break;
      }
    }
  }
  current_indent-=2;
  
}




// Finds all matches one byte pattern.
// Hopefully shygoo adds a js api for his new memory search tool,
// so I don't have to use this slow function anymore.
function findMatches(pattern) {
  var target_length = pattern.length;
  var target_length_m1 = target_length - 1;
  var matches = [];
  var matching = 0;
  
  // Increments by 8 to speed things up.
  for(var i = 0; i < 4194304; i += 8) {
    if(RAM[i] == pattern[matching]) 
      matching++;
    else 
      matching = 0;
    if(matching == target_length)
    {
      matches.push(i - target_length_m1);
      matching = 0;
    }
    if(RAM[i + 1] == pattern[matching]) 
      matching++;
    else 
      matching = 0;
    if(matching == target_length)
    {
      matches.push(i + 1 - target_length_m1);
      matching = 0;
    }
    if(RAM[i + 2] == pattern[matching]) 
      matching++;
    else 
      matching = 0;
    if(matching == target_length)
    {
      matches.push(i + 2 - target_length_m1);
      matching = 0;
    }
    if(RAM[i + 3] == pattern[matching]) 
      matching++;
    else 
      matching = 0;
    if(matching == target_length)
    {
      matches.push(i + 3 - target_length_m1);
      matching = 0;
    }
    if(RAM[i + 4] == pattern[matching]) 
      matching++;
    else 
      matching = 0;
    if(matching == target_length)
    {
      matches.push(i + 4 - target_length_m1);
      matching = 0;
    }
    if(RAM[i + 5] == pattern[matching]) 
      matching++;
    else 
      matching = 0;
    if(matching == target_length)
    {
      matches.push(i + 5 - target_length_m1);
      matching = 0;
    }
    if(RAM[i + 6] == pattern[matching]) 
      matching++;
    else 
      matching = 0;
    if(matching == target_length)
    {
      matches.push(i + 6 - target_length_m1);
      matching = 0;
    }
    if(RAM[i + 7] == pattern[matching]) 
      matching++;
    else 
      matching = 0;
    if(matching == target_length)
    {
      matches.push(i + 7 - target_length_m1);
      matching = 0;
    }
  }
  
  return matches;
}

/*
* This is basically a faster version of findMatches() that assumes the pattern is 4-byte aligned.
*
* Yes you can make this code smaller, but that also makes it a slower.
*/
function findMatchesFaster(pattern) {
  var target_length = pattern.length;
  var target_length_m1 = target_length - 1;
  var matches = [];
  var matching = 0;
  
  // Increments by 8 to speed things up.
  for(var i = 0; i < 4194304; i += 8) {
    if(RAM[i] == pattern[matching]) 
      matching++;
    else 
      matching = 0;
    if(matching == target_length)
    {
      matches.push(i - target_length_m1);
      matching = 0;
    }
    if(matching > 0) {
    if(RAM[i + 1] == pattern[matching]) 
      matching++;
    else 
      matching = 0;
    if(matching == target_length)
    {
      matches.push(i + 1 - target_length_m1);
      matching = 0;
    }
    if(matching > 1) {
    if(RAM[i + 2] == pattern[matching]) 
      matching++;
    else 
      matching = 0;
    if(matching == target_length)
    {
      matches.push(i + 2 - target_length_m1);
      matching = 0;
    }
    if(matching > 2) {
    if(RAM[i + 3] == pattern[matching]) 
      matching++;
    else 
      matching = 0;
    if(matching == target_length)
    {
      matches.push(i + 3 - target_length_m1);
      matching = 0;
    }
    }
    }
    }
    
    if(RAM[i + 4] == pattern[matching]) 
      matching++;
    else 
      matching = 0;
    if(matching == target_length)
    {
      matches.push(i + 4 - target_length_m1);
      matching = 0;
    }
    if(matching > 0) {
    if(RAM[i + 5] == pattern[matching]) 
      matching++;
    else 
      matching = 0;
    if(matching == target_length)
    {
      matches.push(i + 5 - target_length_m1);
      matching = 0;
    }
    if(matching > 1) {
    if(RAM[i + 6] == pattern[matching]) 
      matching++;
    else 
      matching = 0;
    if(matching == target_length)
    {
      matches.push(i + 6 - target_length_m1);
      matching = 0;
    }
    if(matching > 2) {
    if(RAM[i + 7] == pattern[matching]) 
      matching++;
    else 
      matching = 0;
    if(matching == target_length)
    {
      matches.push(i + 7 - target_length_m1);
      matching = 0;
    }
    }
    }
    }
    
  }
  
  return matches;
}


/*
* This is basically a faster version of findMatches() that was made specifically for
* finding RSP signatures in RDRAM.
*
* Yes you can make this code a lot smaller, but that also makes it a lot slower.
*/
function findMatchesFor2PatternsFast(patterns) {
  var target_lengths = [patterns[0].length, patterns[1].length];
  var target_lengths_m1 = [target_lengths[0] - 1, target_lengths[1] - 1];
  var matches = [[], []];
  var matching = [0, 0];
  
  // Assumption: Matches are 8-byte aligned and they are within the first 4MB of memory.
  for(var i = 0; i < 4194304; i += 8) {
    
    if(RAM[i] == patterns[0][matching[0]]) 
      matching[0]++;
    else 
      matching[0] = 0;
    if(matching[0] == target_lengths[0])
    {
      matches[0].push(i - target_lengths_m1[0]);
      matching[0] = 0;
    }
    if(matching[0] > 0) { 
    if(RAM[i + 1] == patterns[0][matching[0]]) 
      matching[0]++;
    else 
      matching[0] = 0;
    if(matching[0] == target_lengths[0])
    {
      matches[0].push(i + 1 - target_lengths_m1[0]);
      matching[0] = 0; 
    }
    if(matching[0] > 1) {
    if(RAM[i + 2] == patterns[0][matching[0]]) 
      matching[0]++;
    else 
      matching[0] = 0;
    if(matching[0] == target_lengths[0])
    {
      matches[0].push(i + 2 - target_lengths_m1[0]);
      matching[0] = 0;
    }
    if(matching[0] > 2) {
    if(RAM[i + 3] == patterns[0][matching[0]]) 
      matching[0]++;
    else 
      matching[0] = 0;
    if(matching[0] == target_lengths[0])
    {
      matches[0].push(i + 3 - target_lengths_m1[0]);
      matching[0] = 0;
    }
    if(matching[0] > 3) {
    if(RAM[i + 4] == patterns[0][matching[0]]) 
      matching[0]++;
    else 
      matching[0] = 0;
    if(matching[0] == target_lengths[0])
    {
      matches[0].push(i + 4 - target_lengths_m1[0]);
      matching[0] = 0;
    }
    if(matching[0] > 4) {
    if(RAM[i + 5] == patterns[0][matching[0]]) 
      matching[0]++;
    else 
      matching[0] = 0;
    if(matching[0] == target_lengths[0])
    {
      matches[0].push(i + 5 - target_lengths_m1[0]);
      matching[0] = 0;
    }
    if(matching[0] > 5) {
    if(RAM[i + 6] == patterns[0][matching[0]]) 
      matching[0]++;
    else 
      matching[0] = 0;
    if(matching[0] == target_lengths[0])
    {
      matches[0].push(i + 6 - target_lengths_m1[0]);
      matching[0] = 0;
    }
    if(matching[0] > 6) {
    if(RAM[i + 7] == patterns[0][matching[0]]) 
      matching[0]++;
    else 
      matching[0] = 0;
    if(matching[0] == target_lengths[0])
    {
      matches[0].push(i + 7 - target_lengths_m1[0]);
      matching[0] = 0;
    }
    }
    }
    }
    }
    }
    }
    }
    
    if(RAM[i] == patterns[1][matching[1]]) 
      matching[1]++;
    else 
      matching[1] = 0;
    if(matching[1] == target_lengths[1])
    {
      matches[1].push(i - target_lengths_m1[1]);
      matching[1] = 0;
    }
    if(matching[1] > 0) { 
    if(RAM[i + 1] == patterns[1][matching[1]]) 
      matching[1]++;
    else 
      matching[1] = 0;
    if(matching[1] == target_lengths[1])
    {
      matches[1].push(i + 1 - target_lengths_m1[1]);
      matching[1] = 0; 
    }
    if(matching[1] > 1) {
    if(RAM[i + 2] == patterns[1][matching[1]]) 
      matching[1]++;
    else 
      matching[1] = 0;
    if(matching[1] == target_lengths[1])
    {
      matches[1].push(i + 2 - target_lengths_m1[1]);
      matching[1] = 0;
    }
    if(matching[1] > 2) {
    if(RAM[i + 3] == patterns[1][matching[1]]) 
      matching[1]++;
    else 
      matching[1] = 0;
    if(matching[1] == target_lengths[1])
    {
      matches[1].push(i + 3 - target_lengths_m1[1]);
      matching[1] = 0;
    }
    if(matching[1] > 3) {
    if(RAM[i + 4] == patterns[1][matching[1]]) 
      matching[1]++;
    else 
      matching[1] = 0;
    if(matching[1] == target_lengths[1])
    {
      matches[1].push(i + 4 - target_lengths_m1[1]);
      matching[1] = 0;
    }
    if(matching[1] > 4) {
    if(RAM[i + 5] == patterns[1][matching[1]]) 
      matching[1]++;
    else 
      matching[1] = 0;
    if(matching[1] == target_lengths[1])
    {
      matches[1].push(i + 5 - target_lengths_m1[1]);
      matching[1] = 0;
    }
    if(matching[1] > 5) {
    if(RAM[i + 6] == patterns[1][matching[1]]) 
      matching[1]++;
    else 
      matching[1] = 0;
    if(matching[1] == target_lengths[1])
    {
      matches[1].push(i + 6 - target_lengths_m1[1]);
      matching[1] = 0;
    }
    if(matching[1] > 6) {
    if(RAM[i + 7] == patterns[1][matching[1]]) 
      matching[1]++;
    else 
      matching[1] = 0;
    if(matching[1] == target_lengths[1])
    {
      matches[1].push(i + 7 - target_lengths_m1[1]);
      matching[1] = 0;
    }
    }
    }
    }
    }
    }
    }
    }
    
  }
  
  return matches;
}

/*************** Start Code ***************/
main();
