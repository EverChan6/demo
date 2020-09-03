<template>
  <h1>{{ msg }}</h1>
  <button @click="count++">count is: {{ count }}</button>
  <p>Edit <code>components/HelloWorld.vue</code> to test hot module replacement.</p>
</template>

<script>
import { ref, watchEffect } from 'vue'
export default {
  props: ['msg'],
  setup(props, context) {
    let count = ref(0)

    watchEffect(() => {
      console.log(props.msg);
    })

    return {
     count
    }
  }
}
</script>
