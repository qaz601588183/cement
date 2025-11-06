<template>
    <div class="login">
        <v-card class="form">
            <div class="gs"></div>
            <div class="label">
                <img :src="logo" height="70" />
                <div class="title my-2">欢迎登录</div>
            </div>
            <v-form ref="formRef" @submit.prevent>
                <div class="mt-4">
                    <!-- <div class="mb-2" style="font-weight: 700">Usename</div> -->
                    <v-text-field
                        v-model="state.username"
                        label="Username"
                        density="comfortable"
                        variant="outlined"
                        clearable
                        :rules="[(firstName: any) => !!firstName || 'required']"
                    ></v-text-field>
                </div>
                <div class="my-4">
                    <!-- <div class="mb-2 mt-4" style="font-weight: 700">Password</div> -->
                    <v-text-field
                        v-model="state.password"
                        type="password"
                        label="Password"
                        density="comfortable"
                        variant="outlined"
                        clearable
                        :rules="[(firstName: any) => !!firstName || 'required']"
                    ></v-text-field>
                </div>
                <!-- <div class="my-4">
                    <div class="mb-2 mt-4" style="font-weight: 700">Captcha</div>
                    <div class="d-flex">
                        <div style="width: 180px">
                            <v-text-field
                                v-model="state.captcha"
                                variant="outlined"
                                density="compact"
                                placeholder="Captcha"
                                clearable
                                hide-details
                                :rules="[(firstName: any) => !!firstName || 'required']"
                            ></v-text-field>
                        </div>
                        <div
                            v-if="svg"
                            v-html="svg"
                            @click="initCaptcha"
                            style="position: relative; top: 3px"
                            class="ml-2"
                        ></div>
                    </div>
                </div> -->
                <div class="my-6">
                    <v-btn :loading="loading" color="primary" block size="large" @click="onSubmit">
                        登录
                    </v-btn>
                </div>
            </v-form>
        </v-card>
    </div>
</template>
<script lang="ts" setup>
import { ApiUser } from '@/api/user';
import logo from '@/assets/admin-logo.png';
import router, { syncRouter } from '@/router';
import { reactive, shallowRef } from 'vue';

const state = reactive({
    username: 'test',
    password: 'test123456',
    // captcha: '',
    isQuick: true,
});

const formRef = shallowRef<any>();
const loading = shallowRef(false);

const onSubmit = async () => {
    try {
        loading.value = true;
        const res = await formRef.value.validate();
        if (!res.valid) {
            loading.value = false;
            return;
        }
        await ApiUser.login(state);
        await syncRouter(true);
        // 确保路由完全准备好
        await router.isReady();
        // 使用 nextTick 确保 DOM 更新完成
        await new Promise((resolve) => setTimeout(resolve, 50));
        loading.value = false;
    } catch (err) {
        loading.value = false;
        console.error('登录失败:', err);
    }
};
</script>
<style lang="scss" scoped>
#vr360 {
    width: 100vw;
    height: 100vh;
    position: absolute;
    left: 0;
    top: 0;
}
.login {
    height: 100vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    .form {
        border-radius: 8px;
        box-shadow: none;
        width: 420px;
        padding: 40px;
        padding-bottom: 16px;
        position: relative;
        z-index: 1;
        // background: transparent;
        // overflow: hidden;
        // &::before {
        //     content: '';
        //     display: block;
        //     position: absolute;
        //     left: 0;
        //     top: 0;
        //     width: 100%;
        //     height: 100%;
        //     filter: blur(100px);
        //     backdrop-filter: blur(200px);
        //     opacity: 0.4;
        //     background: #fff;
        //     z-index: -1;
        // }
        .label {
            text-align: center;
            .title {
                font-size: 32px;
                font-weight: bold;
            }
        }
        .d-flex {
            .text-center {
                flex: 0 0 60px;
            }
        }
    }
}
@media only screen and (max-width: 778px) {
}
</style>
