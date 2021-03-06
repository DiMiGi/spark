<template>
    <div id="form-container" class="d-flex flex-column h-100 mb-3">
        <div id="form-toolbar" class="d-block">
            <nav class="navbar navbar-expand-md override">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item active">
                        <a class="nav-link" @click="mode = 'editor'" href="#">{{ this.$t('Editor') }}</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click="mode = 'preview'" href="#">{{ this.$t('Preview') }}</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click="openComputedProperties" href="#">{{ this.$t('Computed Properties') }}</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click="openCustomCSS" href="#">{{ this.$t('Custom CSS') }}</a>
                    </li>
                </ul>

                <ul class="navbar-nav pull-right">
                    <li class="nav-item" v-if="permission.includes('export-screens')">
                        <a :class="classExportScreen" @click="beforeExportScreen" href="#">
                            <i class="fas fa-file-export"></i>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click="saveScreen(false)" href="#">
                            <i class="fas fa-save"></i>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click="onClose" href="#">
                            <i class="fas fa-times"></i>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>

        <computed-properties v-model="computed" ref="computedProperties"></computed-properties>
        <custom-CSS v-model="customCSS" ref="customCSS" :css-errors="cssErrors"/>
        <vue-form-builder
                @change="updateConfig"
                ref="screenBuilder"
                v-show="displayBuilder"
                config="config"
                computed="computed"/>
        <div v-show="displayPreview" class="h-100" style="display: contents !important">
            <div id="preview"  class="d-flex h-100">
                <div id="data-input" class="w-25 border overflow-auto">
                    <div class="card-header">{{this.$t('Data Input')}}</div>
                    <div class="card-body mb-5">
                        <div class="alert"
                             :class="{'alert-success': previewInputValid, 'alert-danger': !previewInputValid}">
                            <span v-if="previewInputValid">{{this.$t('Valid JSON Data Object')}}</span>
                            <span v-else>{{this.$t('Invalid JSON Data Object')}}</span>
                        </div>
                        <form-text-area rows="20" v-model="previewInput"></form-text-area>
                    </div>
                </div>

                <div id="renderer-container" class="w-50 p-4 pt-5 overflow-auto">
                    <div class="container">
                        <div class="row">
                            <div class="col-sm">
                                <vue-form-renderer
                                        ref="renderer"
                                        @submit="previewSubmit"
                                        v-model="previewData"
                                        :config="config"
                                        :computed="computed"
                                        :custom-css="customCSS"
                                        v-on:css-errors="cssErrors = $event"/>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="data-preview" class="w-25 border overflow-auto">
                    <div class="card-header">{{this.$t('Data Preview')}}</div>
                    <div class="card-body mb-5">
                        <vue-json-pretty :data="previewData"></vue-json-pretty>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
  import ComputedProperties from "@processmaker/spark-screen-builder/src/components/computed-properties";
  import CustomCSS from "@processmaker/spark-screen-builder/src/components/custom-css.vue";
  import VueFormBuilder from "@processmaker/spark-screen-builder/src/components/vue-form-builder";
  import VueFormRenderer from "@processmaker/spark-screen-builder/src/components/vue-form-renderer";
  import VueJsonPretty from "vue-json-pretty";
  import {FormTextArea} from "@processmaker/vue-form-elements/src/components";
  import _ from "lodash";

  export default {
    data() {
      return {
        mode: "editor",
        computed: [],
        customCSS: "",
        errors: false,
        cssErrors: "",
        config: [
          {
            name: "Default",
            items: [],
            computed: []
          }
        ],
        previewData: null,
        previewInput: "{}"
      };
    },
    components: {
      CustomCSS,
      ComputedProperties,
      VueFormRenderer,
      VueFormBuilder,
      VueJsonPretty,
      FormTextArea
    },
    watch: {
      previewInput() {
        if (this.previewInputValid) {
          // Copy data over
          this.previewData = JSON.parse(this.previewInput);
        } else {
          this.previewData = {};
        }
      }
    },
    computed: {
      classExportScreen() {
        let classExport = 'nav-link';
        if (this.$refs.screenBuilder && this.$refs.screenBuilder.validationErrors
          && this.$refs.screenBuilder.validationErrors.length > 0) {
          classExport = 'nav-link disabled';
        }
        return classExport;
      },
      displayBuilder() {
        return this.mode === 'editor';
      },
      displayPreview() {
        return this.mode === 'preview';
      },
      previewInputValid() {
        try {
          if (
            typeof this.previewInput === "string" &&
            this.previewInput.length === 0
          ) {
            return false;
          }
          if (
            typeof this.previewInput === "object" &&
            Object.keys(this.previewInput).length === 0
          ) {
            return true;
          }
          JSON.parse(this.previewInput);
          return true;
        } catch (err) {
          return false;
        }
      }
    },
    props: ["process", "screen", 'permission'],
    mounted() {
      // Add our initial controls
      // Iterate through our initial config set, calling this.addControl
      // Call our init lifecycle event
      ProcessMaker.EventBus.$emit("screen-builder-init", this);
      this.$refs.screenBuilder.config = this.screen.config
        ? this.screen.config
        : [
          {
            name: "Default",
            items: []
          }
        ];

      this.computed = this.screen.computed ? this.screen.computed : [];
      this.customCSS = this.screen.custom_css ? this.screen.custom_css : "";

      this.$refs.screenBuilder.computed = this.screen.computed
        ? this.screen.computed
        : [];

      if (this.screen.title) {
        this.$refs.screenBuilder.config[0].name = this.screen.title;
      }
      this.updatePreview(new Object());
      this.previewInput = "{}";
      ProcessMaker.EventBus.$emit("screen-builder-start", this);
    },
    methods: {
      openComputedProperties() {
        this.$refs.computedProperties.show();
      },
      openCustomCSS() {
        this.$refs.customCSS.show();
      },
      addControl(
        control,
        rendererComponent,
        rendererBinding,
        builderComponent,
        builderBinding
      ) {
        // Add it to the renderer
        this.$refs.renderer.$options.components[
          rendererBinding
          ] = rendererComponent;
        // Add it to the screen builder
        this.$refs.screenBuilder.addControl(control);
        this.$refs.screenBuilder.$options.components[
          builderBinding
          ] = builderComponent;
      },
      refreshSession: _.throttle(function() {
        ProcessMaker.apiClient({
            method: 'POST',
            url: '/keep-alive',
            baseURL: '/',
          })
      }, 60000),
      updateConfig(newConfig) {
        this.config = newConfig;
        this.refreshSession();
      },
      updatePreview(data) {
        this.previewData = data;
      },
      previewSubmit() {
        alert(this.$t("Preview Screen was Submitted"));
      },
      onClose() {
        window.location.href = "/processes/screens";
      },
      checkForErrors() {
        this.errors = this.$refs.screenBuilder.validationErrors
                && this.$refs.screenBuilder.validationErrors.length > 0;
      },
      beforeExportScreen() {
        this.saveScreen(true);
      },
      exportScreen() {
        ProcessMaker.apiClient.post('screens/' + this.screen.id + '/export')
          .then(response => {
            window.location = response.data.url;
            ProcessMaker.alert(this.$t('The screen was exported.'), 'success');
          })
          .catch(error => {
            ProcessMaker.alert(error.response.data.error, 'danger');
          });
      },
      saveScreen(exportScreen) {
        this.checkForErrors();
        if (this.errors == true) {
          ProcessMaker.alert(this.$t("This screen has validation errors."), "danger");
        } else {
          ProcessMaker.apiClient
            .put("screens/" + this.screen.id, {
              title: this.screen.title,
              description: this.screen.description,
              type: this.screen.type,
              config: this.config,
              computed: this.computed,
              custom_css: this.customCSS
            })
            .then(response => {
              if (exportScreen) {
                this.exportScreen();
              }
              ProcessMaker.alert(this.$t("Successfully saved"), "success");
            });
        }
      }
    }
  };

</script>

<style lang="scss">

     .override {
        background-color: #b6bfc6;
        padding: 10px;
        height: 40px;
        font-size: 18px;
        font-style: normal;
        font-stretch: normal;
        line-height: normal;
        letter-spacing: normal;
        text-align: left;
        color: #ffffff;

        .nav-item {
            padding-top: 0;
        }

        a.nav-link,
        a.nav-link:hover {
            color: white !important;
            font-weight: 400;
        }
    }

</style>
