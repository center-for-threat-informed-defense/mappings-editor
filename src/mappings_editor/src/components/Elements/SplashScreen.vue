<template>
    <div class="splash-background">
        <div class="splash-container">
            <div class="splash-header">
                <div>
                    <h1>Mappings Editor</h1>
                    <div style="font-size: small;">Version 1.5.0</div>
                </div>
                
                <img src="@/assets/images/ctid_logo.png" alt="MITRE CTID" height="27"/>
            </div>
            <div class="splash-body">
                <h2>Recover File</h2>
                <ScrollBox>
                    <div class="recover-files-container">
                        <div>Hello</div>
                        <div>Hello</div>
                        <div>Hello</div>
                        <div>Hello</div>
                        <div>Hello</div>
                        <div>Hello</div>
                        <div>Hello</div>
                        <div>Hello</div>
                    </div>
                </ScrollBox>
                <h2>Open File</h2>
                <div class="button-row">
                    <button class="splash-button" @click="closeSplash">
                        <span class="splash-button-title">Create New File</span>
                        <span class="splash-button-description">Description goes here</span>
                    </button>
                    <button class="splash-button" @click="emit('open-file')">
                        <span class="splash-button-title">Open File</span>
                        <span class="splash-button-description">Description goes here</span>
                    </button>
                </div>
                <h2>Resources</h2>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import ScrollBox from '../Containers/ScrollBox.vue';
const emit = defineEmits(['close', 'open-file']);

function closeSplash() {
    emit('close');
}
</script>
<style scoped>
.splash-background {
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    backdrop-filter: blur(5px);
}
.splash-container {
    background-color: rgb(23, 23, 23);
    width: 740px;
    height: 520px;
    border: 1px solid rgb(56, 56, 56);
    border-radius: 10px;
    overflow: hidden;
    color: white;
}

.splash-header {
    background-color: rgb(29, 29, 29);
    border-bottom: 1px solid rgb(56, 56, 56);
    padding: 18px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.splash-header h1 {
    margin: 0;
    font-size: large;
}

.splash-body {
    padding: 30px;
}

.splash-body h2 {
    font-size: small;
    font-weight: normal;
    text-transform: uppercase;
}

.button-row {
    display: flex;
    gap: 10px;
}

.splash-button {
    background: none;
    border: 1px solid rgb(56, 56, 56);
    border-radius: 7px;
    padding: 24px;
    text-align: left;
    flex: 1;
    color: white;
}

.splash-button:hover {
    cursor: pointer;
    background-color: rgba(255, 255, 255, 0.1);
}

.splash-button-title {
    display: block;
    font-size: large;
}

.splash-button-description {
    display: block;
}

.recover-files-container {
    max-height: 100px;
}
</style>
