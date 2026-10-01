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
                <div class="button-row">
                    <button class="splash-button" @click="closeSplash">
                        <span class="splash-button-title">Create New File</span>
                        <span class="splash-button-description">Description goes here</span>
                    </button>
                    <button class="splash-button" @click="closeSplash">
                        <span class="splash-button-title">Open File</span>
                        <span class="splash-button-description">Description goes here</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
const emit = defineEmits(['close']);

function closeSplash() {
    emit('close');
}
</script>
<style scoped>
.splash-background {
    position: fixed;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    
}
.splash-container {
    background-color: rgb(23, 23, 23);
    width: 740px;
    height: 520px;
    border: 1px solid rgb(56, 56, 56);
    border-radius: 10px;
    overflow: hidden;
}

.splash-header {
    background-color: rgb(29, 29, 29);
    border-bottom: 1px solid rgb(56, 56, 56);
    padding: 18px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
}

.splash-header h1 {
    margin: 0;
    font-size: large;
}

.splash-body {
    padding: 30px;
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
</style>
