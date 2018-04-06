$(document).ready(() => {

    const uInput = $('#raw-input');
    const jOutput = $('#json-output');
    const uOutput = $('#output');
    const updateOutput = $('#update-output');

    function interpret() {

        // The user's input
        const rawData = uInput.val();
        const buffer = rawData.split('');

        // We will build the parsed object in standard JSON
        var parsedObject = {
            // The 'context bin' will store everything we couldn't make sense of
            contextBin: [],
        };

        var
        // The context of the current lexical process
        // 0 - The parser is expecting a key
        // 1 - The parser is expecting a value
        context = 0,

        // The key buffer
        keyBuffer = '',

        // The value buffer
        valueBuffer = '',

        // Reset buffers to empty and context to 0
        resetBuffersAndContext = () => {
            keyBuffer = '';
            valueBuffer = '';
            context = 0;
        };

        // Add an arbitrary 'end of buffer' flag to the array
        // We are fine to use 5 hashes here since the buffer
        // consists entirely of single characters, so using
        // any string of more than 1 char means we know we're
        // at the end of the buffer.
        buffer.push('#####');

        // Lexically analyse the buffer
        buffer.forEach((char) => {
            // If it is a terminator OR end of buffer, store key/value pair and/or reset buffers
            // Terminator can be:
            // - Semicolon
            // - Newline
            if(char.match(/\;|\n|\r\n/) || char === '#####') {
                // If key has value, and assignment has begun, then assign
                if(keyBuffer !== '' && context === 1) {
                    parsedObject[keyBuffer] = valueBuffer;
                }
                // If the parser is still reading key upon reaching terminator, put it in the context bin
                else if (keyBuffer !== '' && context === 0) {
                    parsedObject.contextBin.push(keyBuffer);
                }
                resetBuffersAndContext();
            }
            // If it is an assigner, switch the context to expect a value
            else if(char.match(/\:|\=/)) {
                context = 1;

                // Trim the key if there was whitespace
                keyBuffer = keyBuffer.trim();
            }
            // Otherwise, depending on context, increment the key or value buffers
            else {
                // Expecting a key
                if(context === 0) {
                    // Ignore whitespace until we hit a real character
                    if(!(keyBuffer === '' && char === ' ')) {
                        keyBuffer += char;
                    }
                }
                // Expecting a value
                else if(context === 1) {
                    // Ignore whitespace until we hit a real character
                    if(!(valueBuffer === '' && char === ' ')) {
                        valueBuffer += char;
                    }
                }
            }
        });

        // Output the parsed JSON
        // The 2nd and 3rd params make it readable format, '4' being the number of spaces per tab
        jOutput.val(JSON.stringify(parsedObject, null, 4));

        // Now we need to try and interpret the JSON we've made

        // The dictionary will contain key names that are relevant to our map application.
        // Each key name will have synonyms in an attempt to entity match data
        const dictionary = {
            // Longitude
            "longitude": {
                "synonyms": [
                    'long',
                    'lng',
                    'ln',
                ],
            },

            // Latitude
            "latitude": {
                "synonyms": [
                    'lat',
                    'lt',
                ],
            },

            // Coordinate
            "coordinate": {
                "synonyms": [
                    'coord',
                    'point',
                    'cord',
                ],
            },

            // etc. etc.

        };

        // The map object
        var mapObj = {
            additionalData: {},
        };

        // Loop through our data and attempt to match synonyms
        $.each(parsedObject, (pk, pv) => {
            // For each value in our parsed object, check it against the dictionary
            $.each(dictionary, (dk, dv) => {
                // For each synonym, check the data we have against it
                dv.synonyms.forEach((synonym) => {
                    // If the parsed key matches a synonym, then assign that data to the relevant key
                    if(pk === synonym) {
                        mapObj[dk] = pv;
                        parsedObject[pk] = null;
                    }
                });
            });
        });

        // Any data that wasn't classified, add to generic 'data' array in map object
        $.each(parsedObject, (pk, pv) => {
            // Since we removed values as they were classified, anything that isn't null will be 'lost & found' data
            // But we don't want to add the contextBin
            if(pv !== null && pk !== 'contextBin') {
                mapObj.additionalData[pk] = pv;
            }
        });

        // Output the parsed map data
        // The 2nd and 3rd params make it readable format, '4' being the number of spaces per tab
        uOutput.val(JSON.stringify(mapObj, null, 4));
    }

    uInput.keyup(interpret);
    updateOutput.click(interpret);

});
