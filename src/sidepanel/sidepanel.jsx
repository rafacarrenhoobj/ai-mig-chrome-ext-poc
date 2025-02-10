import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Tooltip from '@mui/material/Tooltip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { Button, Container, AppBar, Toolbar, Typography, Box, Avatar } from "@mui/material";

import { fetchToken } from './oauth.js';
import { pushRecord, updateRecord, getObjectDefinitions, createObjectDefinition, publishObjectDefinition, addFieldToObjectDefinition } from './liferay-apis.js';

import {BASE_URL, CLIENT_ID, CLIENT_SECRET, OBJECT_DEFINITION_LOCAL_STORAGE_PREFIX,
    SITE_KEY, LOCALE} from '../config.js';

function SidePanel(props) {

    const [structures, setStructures] = useState([]);

    const [selectedRows, setSelectedRows] = useState({});

    useEffect(() => {

        fetchToken(BASE_URL, CLIENT_ID, CLIENT_SECRET).then(token => {
            getObjectDefinitions(BASE_URL, token).then(data => {
                console.log(data);
                let nextStructures = [];
                data.objectFolderItems.forEach(item => {
                    let newStructure = JSON.parse(localStorage.getItem(OBJECT_DEFINITION_LOCAL_STORAGE_PREFIX + item.objectDefinition.name));
                    nextStructures.push(newStructure);
                });
                setStructures(nextStructures);
            });
        });
        
    }, [props]);

    const mergeRecords = (primaryKey, existingRecords, newRecords) => {
        const keys = primaryKey.split(',').map(key => key.trim()); // Gère une liste de clés ou une seule clé
        const recordMap = new Map();
    
        const generateKey = (record) => keys.map(key => record[key]).join('|'); // Construit une clé unique
    
        [...existingRecords, ...newRecords].forEach((record) => {
            const compositeKey = generateKey(record); // Génère la clé unique
            recordMap.set(compositeKey, record);
        });
    
        return Array.from(recordMap.values());
    };

    const handleSelectionChange = (structureName, selection) => {
        console.log(selection);
        setSelectedRows((prev) => ({
            ...prev,
            [structureName]: selection,
        }));
    };

    const handlePushData = (structureName) => {
        // Find the structure and filter records based on selected indices
        const structure = structures.find((s) => s.name === structureName);
        console.log("CURRENT STRUCTURE");
        console.log(structure);
        console.log(selectedRows);

        console.log("Pushing data to API:");

        fetchToken(BASE_URL, CLIENT_ID, CLIENT_SECRET).then(token => {

            structure?.records.map((record, index) => {
                if(selectedRows[structureName]?.includes(index+1)) {

                    if(record.externalReferenceCode === undefined) {
                        pushRecord(BASE_URL, token, structure, SITE_KEY, record, LOCALE)
                        .then((data) => {
                            console.log('Success:', data);
                            updateRecordExternalReferenceCode(structureName, index, data.externalReferenceCode);
                            enqueueSnackbar('Created record: ' + record[structure.titleFieldName]);
                        })
                        .catch((error) => console.error('Error:', error));
                    } else {
                        updateRecord(BASE_URL, token, structure, SITE_KEY, record, LOCALE)
                        .then((data) => {
                            console.log('Success:', data);
                            enqueueSnackbar('Updated record: ' + record[structure.titleFieldName]);
                        })
                        .catch((error) => console.error('Error:', error));
                    }

                }
            });

        });

    }

    const updateRecordExternalReferenceCode = (structureName, recordId, externalReferenceCode) => {
        console.log("UPD: " + structureName + " " + recordId + " " + externalReferenceCode);
    
        setStructures((prevStructures) => {
            const nextStructures = prevStructures.map((item) =>
                item.name === structureName
                    ? {
                          ...item,
                          records: item.records.map((record, index) =>
                              index === recordId
                                  ? {
                                        ...record,
                                        externalReferenceCode: externalReferenceCode,
                                    }
                                  : record
                          ),
                      }
                    : item
            );
    
            // Update localStorage with the updated structure
            const updatedStructure = nextStructures.find((item) => item.name === structureName);
            if (updatedStructure) {
                localStorage.setItem(
                    `${OBJECT_DEFINITION_LOCAL_STORAGE_PREFIX}${structureName}`,
                    JSON.stringify(updatedStructure)
                );
            }
    
            console.log("NEXT");
            console.log(nextStructures);
    
            return nextStructures;
        });
    };

    const markNewFlags = (structureName) => {
        setStructures((prevStructures) => {
            const nextStructures = prevStructures.map((item) => {
                if (item.name === structureName) {
                    // Create the updated structure
                    const updatedStructure = {
                        ...item,
                        // Set the top-level "new" flag to false
                        new: false,
                        // Update "fields" to set all "new" flags to false
                        fields: item.fields.map((field) => ({
                            ...field,
                            new: false,
                        })),
                        // Keep "records" unchanged
                        records: [...item.records],
                    };
    
                    // Update localStorage with the updated structure
                    localStorage.setItem(
                        OBJECT_DEFINITION_LOCAL_STORAGE_PREFIX + structureName,
                        JSON.stringify(updatedStructure)
                    );
    
                    return updatedStructure; // Return the updated structure
                }
    
                return item; // Return the original item if it doesn't match
            });
    
            console.log("NEXT");
            console.log(nextStructures);
            return nextStructures;
        });
    };

    useEffect(() => {
        console.log("Structures updated:", structures);
    }, [structures]);
    
    const handleCreateStructure = (structureName) => {
        // Find the structure and filter records based on selected indices
        const structure = structures.find((s) => s.name === structureName);
        console.log("CURRENT STRUCTURE");
        console.log(structure);
        console.log("Calling API to create structure...");

        fetchToken(BASE_URL, CLIENT_ID, CLIENT_SECRET).then(token => {

            createObjectDefinition(BASE_URL, token, structure)
                .then((data) => {

                    console.log('Success:', data);

                    // Update state with a functional update
                    setStructures((prev) =>
                        prev.map((item) =>
                            item.name === structureName ? { ...item, _restContextPath: data.restContextPath } : item
                        )
                    );
                    
                    publishObjectDefinition(BASE_URL, token, data.id)
                        .then((data) => {
                            console.log('Success:', data);
                            markNewFlags(structureName);
                            enqueueSnackbar('Created new object: ' + structureName);
                        })
                        .catch((error) => console.error('Error:', error));

                })
                .catch((error) => console.error('Error:', error));

        });

    };

    async function processFieldsSequentially(fields, baseUrl, token, structureName) {
        for (const field of fields) {
            try {
                const data = await addFieldToObjectDefinition(baseUrl, token, structureName, field);
                enqueueSnackbar('Created field: ' + field.name);

                console.log(`Field "${field.name}" added successfully.`);
                console.log("API Response:", data);
    
                // Optionally update the local `new` flag to false for the field
                field.new = false;
            } catch (error) {
                console.error(`Error adding field "${field.name}":`, error);
            }
        }
    }

    const handleUpdateStructure = (structureName) => {
        // Find the structure
        const structure = structures.find((s) => s.name === structureName);
        if (!structure) {
            console.error(`Structure with name "${structureName}" not found.`);
            return;
        }
    
        console.log("CURRENT STRUCTURE");
        console.log(structure);
        console.log("Calling API to update structure...");
    
        // Fetch the token
        fetchToken(BASE_URL, CLIENT_ID, CLIENT_SECRET).then((token) => {
            if (!token) {
                console.error("Failed to fetch token.");
                return;
            }
    
            // Iterate over fields where "new" is true
            const newFields = structure.fields.filter((field) => field.new);
            if (newFields.length === 0) {
                console.log("No new fields to update.");
                return;
            }
    
            processFieldsSequentially(newFields, BASE_URL, token, structureName);

            // Process each new field and call the API
            /*
            newFields.forEach((field) => {
                addFieldToObjectDefinition(BASE_URL, token, structureName, field)
                    .then((data) => {
                        console.log(`Field "${field.name}" added successfully.`);
                        console.log("API Response:", data);
    
                        // Optionally update the local `new` flag to false for the field
                        field.new = false;
                    })
                    .catch((error) => {
                        console.error(`Error adding field "${field.name}":`, error);
                    });
            });
            */
    
            // Update local storage after processing all fields
            const updatedStructure = {
                ...structure,
                fields: structure.fields.map((field) => ({
                    ...field,
                    new: false, // Mark all fields as no longer new
                })),
            };

            setStructures((prev) =>
                prev.map((item) =>
                    item.name === structureName ? updatedStructure : item
                )
            );

            localStorage.setItem(
                OBJECT_DEFINITION_LOCAL_STORAGE_PREFIX + structureName,
                JSON.stringify(updatedStructure)
            );
    
            console.log("Local storage updated with new structure:");
            console.log(updatedStructure);
        });
    };

    useEffect(() => {
        // Define the message handler
        const handleMessage = (message, sender, sendResponse) => {
            if (message.type === 'RETURN_EXTRACTED_RECORDS') {
                console.log("RETURN_EXTRACTED_RECORDS");
                //enqueueSnackbar("Extraction complete!");
                const extractedStructure = JSON.parse(message?.structure);
                console.log(extractedStructure);

                console.log("Existing structures");
                console.log(structures);

                // Update state with a functional update
                setStructures((prevStructures) => {
                    const nextStructures = prevStructures.some((item) => item.name === extractedStructure.name)
                        ? prevStructures.map((item) =>
                            item.name === extractedStructure.name
                                ? {
                                        ...item,
                                        records: mergeRecords(extractedStructure.primaryKey, item.records, extractedStructure.records)
                                    }
                                : item
                        )
                        : [...prevStructures, extractedStructure];

                    console.log(nextStructures);
                    return nextStructures;
                });

            }
        };

        // Add the listener for messages
        chrome.runtime.onMessage.addListener(handleMessage);

        // Cleanup the listener when the component unmounts
        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
        };
    }, []);

    useEffect(() => {
        // Define the message handler
        const handleMessage = (message, sender, sendResponse) => {
            if (message.type === 'RETURN_ENRICHED_RECORD') {
                console.log("RETURN_ENRICHED_RECORD");
                //enqueueSnackbar("Extraction complete!");
                const extractedStructure = JSON.parse(message?.structure);
                console.log(extractedStructure);
    
                console.log("Existing structures");
                console.log(structures);
    
                // Update state with a functional update
                setStructures((prevStructures) => {
                    const nextStructures = prevStructures.some((item) => item.name === extractedStructure.name)
                        ? prevStructures.map((item) =>
                            item.name === extractedStructure.name
                                ? {
                                      ...item,
                                      // Update fields: Merge existing fields with the new ones
                                      fields: extractedStructure.fields,
                                      // Update records
                                      records: mergeRecords(
                                          extractedStructure.primaryKey,
                                          item.records,
                                          extractedStructure.records
                                      ),
                                  }
                                : item
                        )
                        : [...prevStructures, extractedStructure];
    
                    console.log(nextStructures);
                    return nextStructures;
                });
            }
        };
    
        // Add the listener for messages
        chrome.runtime.onMessage.addListener(handleMessage);
    
        // Cleanup the listener when the component unmounts
        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
        };
    }, []);

    const handleSelectElements = async () => {
        //setThinking(true);

        const sampleStructures = structures.map((structure) => ({
            ...structure,
            records: structure.records.slice(0, 1), // Keep only the first record
        }));

        chrome.runtime.sendMessage({ type: "REQUEST_SELECT_ELEMENT", structures: sampleStructures }, (response) => {
            if (response) {
                console.log("Select element response:");
                console.log(response);
            } else {
                console.error("Failed to select element.");
            }
        });        
    };

    const getRecordRows = (records) => {
        return records.map((record, index) => ({
            ...record,
            id: index + 1, // Increment starting from 1
        }));
    };

    const handleMoreInfoUrlClick = (externalReferenceCode, url, structure) => {
        console.log("FOLLOW URL " + url + " for ERC " + externalReferenceCode);
    
        // Filter the records to include only the one with the matching externalReferenceCode
        const filteredStructure = {
            ...structure,
            records: structure.records.filter((record) => record.externalReferenceCode === externalReferenceCode),
        };
    
        chrome.runtime.sendMessage(
            {
                type: "REQUEST_MORE_INFO",
                structure: filteredStructure, // Send the filtered structure
                externalReferenceCode: externalReferenceCode,
                url: url,
            },
            (response) => {
                if (response) {
                    console.log("More info response:");
                    console.log(response);
                } else {
                    console.error("Failed to get more info.");
                }
            }
        );
    };

    const handleToggle = (name) => {
        setStructures((prev) =>
            prev.map((item) =>
                item.name === name ? { ...item, _open: !item._open } : item
            )
        );
    };

    return (
        <Container style={{ textAlign: "center", marginTop: "50px" }}>

            <AppBar position="static" sx={{ backgroundColor: "#333", padding: "8px" }}>
                <Toolbar>
                    {/* Logo Image */}
                    <Avatar
                        src="assets/AI.webp" // Replace with actual image path
                        alt="AI Assistant Logo"
                        sx={{ width: 40, height: 40, marginRight: 2 }}
                    />
                    
                    {/* Title */}
                    <Typography variant="h4" gutterBottom>
                        Liferay migration assistant
                    </Typography>
                </Toolbar>
            </AppBar>

            <Typography variant="body1" gutterBottom>
                Search for structured contents.                                
            </Typography>

            <Button variant="contained" color="primary" startIcon={<SmartToyIcon />} onClick={handleSelectElements} >
                Select elements in a new structure
            </Button> 

            <br />

            {structures.length == 0 ? (
                <></>
            ) : (
                <>

                    <SnackbarProvider maxSnack={10} />

                    <Box sx={{ flexGrow: 1 }}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h5" gutterBottom>
                                Structured contents
                            </Typography>
                            <List>
                                {structures.map((structure, structureIndex) => (
                                    <>
                                        <ListItem>
                                            <Stack spacing={2}>
                                                <>
                                                    <ListItemText
                                                        primary={structure.name}
                                                        secondary={structure.description}
                                                    />
                                                    <Button 
                                                        variant="contained" 
                                                        onClick={() => handleToggle(structure.name)}
                                                    >
                                                        {structure._open ? "Hide" : "Show"}
                                                    </Button>  
                                                </>
                                                <Collapse in={structure._open}>
                                                    {structure.fields && 
                                                        (
                                                            <Stack spacing={2}>
                                                                <DataGrid
                                                                    rows={getRecordRows(structure.records)}
                                                                    columns={[
                                                                        {
                                                                            field: "id",
                                                                            headerName: "ID",
                                                                            width: 48
                                                                        }, {
                                                                            field: structure.titleFieldName,
                                                                            headerName: structure.fields.find(item => item.name === structure.titleFieldName).label,
                                                                            renderCell: (params) => {
                                                                                // Generate table content for the tooltip
                                                                                const tooltipContent = (
                                                                                    <Table size="small">
                                                                                        <TableBody>
                                                                                            {Object.entries(params.row).map(([key, value]) => {
                                                                                                const label = structure.fields.find((field) => field.name === key)?.label || key;
                                                                                                const truncatedValue = value?.toString().length > 100
                                                                                                    ? `${value.toString().slice(0, 100)}...`
                                                                                                    : value;
                                                                
                                                                                                return (
                                                                                                    <TableRow key={key}>
                                                                                                        <TableCell style={{ fontWeight: "bold", fontSize: "85%", width: "142px", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                                                                            {label}
                                                                                                        </TableCell>
                                                                                                        <TableCell style={{
                                                                                                            fontSize: "85%",
                                                                                                            width: "450px",
                                                                                                            overflow: "hidden",
                                                                                                            textOverflow: "ellipsis",
                                                                                                            whiteSpace: "nowrap",
                                                                                                        }}>
                                                                                                            {truncatedValue}
                                                                                                        </TableCell>
                                                                                                    </TableRow>
                                                                                                );
                                                                                            })}
                                                                                        </TableBody>
                                                                                    </Table>
                                                                                );
                                                                
                                                                                return (
                                                                                    <Tooltip
                                                                                        title={tooltipContent}
                                                                                        arrow
                                                                                        componentsProps={{
                                                                                            tooltip: {
                                                                                                sx: {
                                                                                                    maxWidth: 600,
                                                                                                    overflow: "hidden",
                                                                                                    padding: "4px",
                                                                                                    backgroundColor: "#f9f9f9",
                                                                                                },
                                                                                            },
                                                                                        }}
                                                                                    >
                                                                                        <span style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                                                                                            {params.value}
                                                                                        </span>
                                                                                    </Tooltip>
                                                                                );
                                                                            },
                                                                            flex: 1
                                                                        }, {
                                                                            field: "moreInfoUrl",
                                                                            headerName: "More info",
                                                                            width: 144,
                                                                            renderCell: (params) => {
                                                                                // Check if externalReferenceCode exists and is not empty
                                                                                const externalReferenceCode = params.row.externalReferenceCode;
                                                                                const moreInfoUrl = params.value;

                                                                                if (externalReferenceCode && moreInfoUrl) {
                                                                                    return (
                                                                                        <Button
                                                                                            variant="contained"
                                                                                            color="primary"
                                                                                            onClick={() => handleMoreInfoUrlClick(externalReferenceCode, moreInfoUrl, structure)}
                                                                                        >
                                                                                            More Info
                                                                                        </Button>
                                                                                    );
                                                                                }

                                                                                return null; // Render nothing if condition is not met
                                                                            }
                                                                        }                                                                    
                                                                    ]}
                                                                    initialState={{ pagination: { page: 0, pageSize: 5 } }}
                                                                    pageSizeOptions={[5, 10]}
                                                                    checkboxSelection
                                                                    sx={{ border: 0 }}
                                                                    onRowSelectionModelChange={(selection) =>
                                                                        handleSelectionChange(structure.name, selection)
                                                                    }
                                                                />
                                                                <Stack
                                                                    direction="row"
                                                                    divider={<Divider orientation="vertical" flexItem />}
                                                                    spacing={2}
                                                                >
                                                                    {(structure.new === undefined || structure.new === "" || structure.new) && (
                                                                        <Button
                                                                            variant="contained"
                                                                            color="primary"
                                                                            sx={{ mt: 2 }}
                                                                            onClick={() => handleCreateStructure(structure.name)}
                                                                        >
                                                                            Create the structure
                                                                        </Button>
                                                                    )}
                                                                    {!structure.new && structure.fields.some((field) => field.new) && (
                                                                        <Button
                                                                            variant="contained"
                                                                            color="primary"
                                                                            sx={{ mt: 2 }}
                                                                            onClick={() => handleUpdateStructure(structure.name)}
                                                                            >
                                                                                Update the structure
                                                                        </Button>
                                                                    )}                                                            
                                                                    <Button
                                                                        variant="contained"
                                                                        color="primary"
                                                                        sx={{ mt: 2 }}
                                                                        onClick={() => handlePushData(structure.name)}
                                                                    >
                                                                        Push Selected Data
                                                                    </Button>                                                        
                                                                </Stack>
                                                            </Stack>
                                                        )
                                                    }
                                                </Collapse>
                                            </Stack>
                                        </ListItem>
                                    </>
                                ))}
                            </List>
                        </Grid>
                    </Box>

                </>
            )}



        </Container>
    );
}

ReactDOM.render(<SidePanel />, document.getElementById('root'));