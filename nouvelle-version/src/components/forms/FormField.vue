<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  modelValue: { type: String, default: '' },
  type: { type: String, default: 'text' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  optional: { type: Boolean, default: false },
  textarea: { type: Boolean, default: false },
  autocomplete: { type: String, default: undefined },
  inputmode: { type: String, default: undefined },
  maxlength: { type: Number, default: undefined },
  rows: { type: Number, default: 5 },
})
defineEmits(['update:modelValue', 'blur'])

const id = useId()
const describedBy = computed(() => [props.error && `${id}-err`, props.hint && `${id}-hint`].filter(Boolean).join(' ') || undefined)
</script>

<template>
  <div class="field">
    <label :for="id">{{ label }} <span v-if="optional" class="optional">(facultatif)</span></label>
    <component
      :is="textarea ? 'textarea' : 'input'"
      :id="id"
      class="input"
      :type="textarea ? undefined : type"
      :rows="textarea ? rows : undefined"
      :value="modelValue"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :maxlength="maxlength"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="describedBy"
      :aria-required="optional ? undefined : 'true'"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur')"
    />
    <p v-if="hint" :id="`${id}-hint`" class="field-hint">{{ hint }}</p>
    <p v-if="error" :id="`${id}-err`" class="field-error" role="alert">{{ error }}</p>
  </div>
</template>
