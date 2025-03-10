<script lang="ts">
  import './markdown.less';
  import type { Page, PageId } from './pages.store';
  import { updatePage } from './pages.store';
  import { marked } from 'marked';
  import Pencil from './pencil.svg?component';
  import { settings } from './settings.store';
  import { focusCard } from './focusHelpers';

  export let page: Page;
  export let taborder: number;
  export let editing = false;

  let editor: HTMLElement;

  $: active = page.active && $settings.showDescription;
  $: focus = page.focus && $settings.showDescription;
  $: if (editing && editor) {
    requestAnimationFrame(() => {
      editor.focus();
    });
  }

  function onClickEdit() {
    editing = true;
  }

  function onKeyDownEditButton(event: KeyboardEvent) {
    if (['Enter', ' ', 'Escape'].includes(event.key)) {
      event.stopPropagation();
    }
  }

  function onKeyDownEditor(event: KeyboardEvent) {
    if (event.key !== 'Tab') {
      event.stopPropagation();
    }

    if (['Escape'].includes(event.key)) {
      event.stopPropagation();
      event.preventDefault();
      focusCard(page.id);
    }
  }

  function onClickEditor(event: MouseEvent) {
    event.stopPropagation();
  }

  function onBlur(event: FocusEvent) {
    const target = event.target as HTMLElement;
    const description = target.innerText.trim();
    if (!description) target.innerText = description;
    updatePage({ ...page, description });
    editing = false;
  }
</script>

<div class="description" class:active class:focus class:editing data-testid="Description">
  {#if active && !editing}
    <button
      type="button"
      class="edit-button"
      on:click={onClickEdit}
      on:keydown={onKeyDownEditButton}
      tabindex={active && focus ? taborder : -1}
      title={page.description ? 'Edit description' : 'Add description'}
    >
      <Pencil />
    </button>
  {/if}

  <div class="scrollable">
    {#if active && focus && editing}
      <div
        class="editor"
        bind:this={editor}
        on:keydown={onKeyDownEditor}
        on:click={onClickEditor}
        on:blur={onBlur}
        contenteditable="true"
        role="textbox"
        aria-multiline="true"
        tabindex={taborder}
      >
        {page.description || ''}
      </div>
    {:else}
      <div class="content markdown" on:dblclick={onClickEdit} role="document">
        {@html marked.parse(page.description || '')}
      </div>
    {/if}
  </div>
</div>

<style lang="less">
  .description {
    display: flex;
    flex-direction: column;
    pointer-events: none;
    position: relative;
    flex-grow: 1;
    overflow: hidden;
    max-width: 0;
    max-height: 0;
    opacity: 0;
    border-top: 0px solid transparent;
    isolation: isolate;

    &.active {
      @height-transition-time: calc(var(--card-animation-speed) * 2);
      transition:
        opacity @height-transition-time ease-in-out,
        max-height @height-transition-time ease-in-out,
        border-color @height-transition-time ease-in-out;
      transition-delay: @height-transition-time;
      border-top: 1px solid fade(black, 30%);
      pointer-events: auto;
      opacity: 1;
      --width: calc(var(--card-max-width) * var(--active-page-scale, 1));
      --height: calc(var(--width) / var(--aspect-ratio));
      max-width: var(--width);
      max-height: var(--height);
    }

    .scrollable {
      overflow: auto;
      flex-grow: 1;
      padding: 18px;
    }
    &:not(.editing) .scrollable {
      mask-image: linear-gradient(0deg, rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 1) 20px);
    }
    &.editing .scrollable {
      outline-style: auto;
      outline-width: 2px;
      outline-color: blue;
      outline-offset: -4px;
    }

    .editor,
    .content {
      display: block;
      padding-bottom: 48px;
      outline: none;
    }
    .editor {
      white-space: pre-wrap;
      overflow-wrap: break-word;
      min-height: 100%;
      padding-bottom: 36px;
    }

    .content {
      &:empty::before {
        font-weight: normal;
        content: var(--description-placeholder);
        opacity: 0.5;
      }
    }

    .edit-button {
      opacity: 0;
      position: absolute;
      cursor: pointer;
      right: 16px;
      bottom: 16px;
      z-index: 1;
      :global(svg) {
        width: auto;
        height: 16px;
      }
      background-color: white;
      color: black;
      border: 1px solid black;
      padding: 4px 12px;
      border-radius: 4px;

      &:focus {
        opacity: 1;
        outline-style: solid;
        outline-width: 1px;
        outline-color: black;
      }
    }

    &:hover,
    &.focus {
      .edit-button {
        opacity: 0.5;
        &:hover,
        &:focus {
          opacity: 1;
        }
      }
    }
  }
</style>
