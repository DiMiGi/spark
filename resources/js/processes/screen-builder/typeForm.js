import Vue from 'vue';
import initialControls from "@processmaker/spark-screen-builder/src/form-builder-controls";
import globalProperties from "@processmaker/spark-screen-builder/src/global-properties";
import FormText from "@processmaker/spark-screen-builder/src/components/renderer/form-text";
import FileDownload from "./components/file-download"
import FileUpload from "./components/form/file-upload"
import DateTimePicker from './components/form/date-time';
import datetime_format from "./../../data/datetime_formats.json";
import timeszones_format from "./../../data/timeszones.json";

Vue.component('FileUpload', FileUpload);
Vue.component('FileDownload', FileDownload);
Vue.component('DateTimePicker', DateTimePicker);

// used to format json keys to be used as a select in the inspector
let datetime_format_options = JSON.parse(JSON.stringify(datetime_format).split('"title":').join('"content":').split('"calendarFormat":').join('"value":'));
let timeszones_format_options = JSON.parse(JSON.stringify(timeszones_format).replace(/(".*?")/g,"{\"value\":$1,\"content\":$1}"));

initialControls.splice(6, 0, {
    rendererComponent: DateTimePicker,
    rendererBinding: 'DateTimePicker',
    builderComponent: DateTimePicker,
    builderBinding: 'DateTimePicker',
    control: {
        label: 'Date Time Picker',
        component: 'DateTimePicker',
        'editor-component': 'DateTimePicker',
        'editor-icon': require('./components/form/date-time-regular.svg'),
        config: {
            label: "New Date Time",
            type: 'datetime',
            format: "dd/LL/yyyy H:mm",
            valueZone: "America/Santiago"
        },
        inspector: [{
                type: "FormInput",
                field: "name",
                config: {
                    label: "Field Name",
                    name: 'Field Name',
                    validation: 'required',
                    helper: "The data name for this field"
                }
            },
            {
                type: "FormInput",
                field: "label",
                config: {
                    label: "Field Label",
                    helper: "The label describes the fields name"
                }
            },
            {
                type: "FormInput",
                field: "placeholder",
                config: {
                    label: "Placeholder",
                    helper: "The placeholder is what is shown in the field when no value is provided yet"
                }
            },
            {
              type: "FormSelect",
              field: "type",
              config: {
                  label: "Input Type",
                  validation: 'required',
                  helper: "The data type for this field",
                  options:
                  [
                    {
                      value: 'date',
                      content: 'Date Only'
                    },
                    {
                      value: 'time',
                      content: 'Time Only'
                    },
                    {
                      value: 'datetime',
                      content: 'Date and Time'
                    }
                  ]
              }
            },
            {
              type: "FormSelect",
              field: "format",
              config: {
                  label: "Input display format",
                  helper: "The display date and time format for this field",
                  options: datetime_format_options
              }
            },
            {
              type: "FormSelect",
              field: "valueZone",
              config: {
                  label: "Time zone",
                  validation: 'required',
                  helper: "The zone value for this field",
                  options: timeszones_format_options
              }
            },
        ]
    }
});
initialControls.push({
    rendererComponent: FileUpload,
    rendererBinding: 'FileUpload',
    builderComponent: FileUpload,
    builderBinding: 'FileUpload',
    control: {
        label: 'File Upload',
        component: 'FileUpload',
        'editor-component': 'FileUpload',
        'editor-icon': require('./components/form/file-upload.png'),
        config: {
            label: 'New File Upload'
        },
        inspector: [{
            type: "FormInput",
            field: "label",
            config: {
                label: "Text Label",
                helper: "The text to display",
            }
        },
        {
            type: "FormInput",
            field: "name",
            config: {
                label: 'Upload Name',
                helper: "The name of the upload",
            }
        }
        ]
    }
});
initialControls.push({
    rendererComponent: FormText,
    rendererBinding: 'FormText',
    builderComponent: FileDownload,
    builderBinding: 'FileDownload',
    control: {
        label: 'File Download',
        component: 'FileDownload',
        'editor-component': 'FormText',
        'editor-icon': require('./components/file-download.png'),
        config: {
            label: 'New File Download'
        },
        inspector: [{
            type: "FormInput",
            field: "label",
            config: {
                label: "Text Label",
                helper: "The text to display",
            }
        },
        {
            type: "FormInput",
            field: "name",
            config: {
                label: 'Download Name',
                helper: "The name of the Download",
            }
        }
        ]
    }
});

ProcessMaker.EventBus.$on('screen-builder-init', (manager) => {

    for (let i = 0; i < initialControls.length; i++) {
        //Load of additional properties for inspector
        Array.prototype.push.apply(initialControls[i].control.inspector, globalProperties[0].inspector);
        manager.addControl(
            initialControls[i].control,
            initialControls[i].rendererComponent,
            initialControls[i].rendererBinding,
            initialControls[i].builderComponent,
            initialControls[i].builderBinding
        );
    }
});
