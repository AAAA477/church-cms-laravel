@extends('layouts.admin.layout')

@section('content')
<div class="w-full">
    <div>
        <h1 class="admin-h1 mb-5 flex items-center">
            <a href="{{ url('/admin/sermons') }}" title="Back" class="rounded-full bg-gray-300 p-2">
                <img src="{{ url('/uploads/icons/back.svg') }}" class="w-3 h-3">
            </a>
            <span class="mx-3">Create Sermon</span>
        </h1>
    </div>
    @include('partials.message')
    <div class="bg-white shadow px-4 py-3">
        <form method="POST" action="{{ url('/admin/sermon/save') }}" enctype="multipart/form-data">
            @csrf
            <div class="my-5">
                <div class="">
                    <div class="w-full lg:w-1/4">
                        <label for="title" class="tw-form-label">Title</label>
                    </div>
                    <div class="w-full lg:w-2/5 my-2">
                        <input type="text" name="title" id="title" value="{{ old('title') }}" class="tw-form-control w-full">
                        <span class="text-danger text-xs">{{ $errors->first('title') }}</span>
                    </div>
                </div>
            </div>
            <div class="my-5">
                <div class="">
                    <div class="w-full lg:w-1/4">
                        <label class="tw-form-label">Description</label>
                    </div>
                    <div class="w-full lg:w-2/5 my-2">
                        <textarea name="description" id="description" class="tw-form-control w-full" rows="3">{{ old('description') }}</textarea>
                        <span class="text-danger text-xs">{{ $errors->first('description') }}</span>
                    </div>
                </div>
            </div>

            {{-- ── Cover Image ──────────────────────────────────────────────────── --}}
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm mb-5">
                <div class="px-6 py-4 border-b border-gray-100">
                    <h2 class="text-sm font-semibold text-gray-700">Cover Image <span class="text-gray-400 font-normal text-xs ml-1">(optional)</span></h2>
                </div>
                <div class="px-6 py-5">
                    <input type="hidden" name="cover_image_id" id="cover_image_id" value="{{ old('cover_image_id') }}">
                    <input type="hidden" name="cover_image_path" id="cover_image_path" value="{{ old('cover_image_path') }}">

                    <div id="cover-preview" class="{{ old('cover_image_path') ? '' : 'hidden' }} mb-3">
                        <img id="cover-preview-img"
                            src="{{ old('cover_image_path') }}"
                            class="w-full max-w-xs h-32 object-cover rounded-lg border border-gray-200">
                    </div>

                    <div class="flex gap-3 items-center">
                        <button type="button" id="open-picker-btn"
                            class="text-sm text-indigo-600 border border-indigo-300 rounded px-3 py-1.5 hover:bg-indigo-50 transition">
                            <i class="fas fa-images mr-1"></i>
                            <span id="picker-btn-label">{{ old('cover_image_path') ? 'Change Image' : 'Pick from Media Library' }}</span>
                        </button>
                        <button type="button" id="clear-image-btn"
                            class="{{ old('cover_image_path') ? '' : 'hidden' }} text-sm text-red-400 hover:text-red-600">
                            <i class="fas fa-times mr-1"></i>Remove
                        </button>
                    </div>
                </div>
            </div>

            {{-- Image Picker Modal — starts hidden; JS adds 'flex' when opening --}}
            <div id="image-picker-modal"
                data-images-url="{{ url('/admin/mediafile/images') }}"
                class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 items-center justify-center p-4">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col" style="max-height:80vh">
                    <div class="flex justify-between items-center px-6 py-4 border-b flex-shrink-0">
                        <h2 class="text-base font-semibold">Pick a Cover Image</h2>
                        <button type="button" id="close-picker-btn" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                    </div>
                    <div class="px-6 py-4 flex-1 overflow-y-auto">
                        <p id="picker-loading" class="text-sm text-gray-400 py-4 text-center">Loading images…</p>
                        <p id="picker-empty" class="hidden text-sm text-gray-500 py-4">
                            No images in the media library.
                            <a href="{{ url('/admin/mediafile/image/create') }}" target="_blank" class="text-indigo-600 underline">Upload images here</a>.
                        </p>
                        <div id="picker-grid" class="hidden gap-3" style="grid-template-columns: repeat(3, minmax(0, 1fr))"></div>
                    </div>
                    <div class="flex justify-end px-6 py-3 border-t flex-shrink-0">
                        <button type="button" id="picker-done-btn"
                            class="blue-bg text-white text-sm px-4 py-1.5 rounded">Done</button>
                    </div>
                </div>
            </div>

            <div class="my-6">
                <button class="btn btn-primary blue-bg text-white rounded px-3 py-1 text-sm font-medium" id="create">Create</button>
            </div>
        </form>
    </div>
</div>
@endsection
@push('scripts')
<script>
    (function() {
        // ── Cover image picker ───────────────────────────────────────────────
        const modal = document.getElementById('image-picker-modal');
        const openBtn = document.getElementById('open-picker-btn');
        const closeBtn = document.getElementById('close-picker-btn');
        const doneBtn = document.getElementById('picker-done-btn');
        const grid = document.getElementById('picker-grid');
        const loadingMsg = document.getElementById('picker-loading');
        const emptyMsg = document.getElementById('picker-empty');
        const previewWrap = document.getElementById('cover-preview');
        const previewImg = document.getElementById('cover-preview-img');
        const clearBtn = document.getElementById('clear-image-btn');
        const btnLabel = document.getElementById('picker-btn-label');
        const inputId = document.getElementById('cover_image_id');
        const inputPath = document.getElementById('cover_image_path');

        var selectedId = inputId ? inputId.value : '';
        var selectedPath = inputPath ? inputPath.value : '';
        var imagesLoaded = false;

        function openModal() {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            if (!imagesLoaded) loadImages();
        }

        function closeModal() {
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }

        function loadImages() {
            loadingMsg.classList.remove('hidden');
            emptyMsg.classList.add('hidden');
            grid.classList.add('hidden');
            grid.style.display = '';

            fetch(modal.dataset.imagesUrl, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(function(r) {
                    return r.json();
                })
                .then(function(res) {
                    loadingMsg.classList.add('hidden');
                    var images = res.data || [];
                    if (images.length === 0) {
                        emptyMsg.classList.remove('hidden');
                        return;
                    }
                    grid.innerHTML = '';
                    images.forEach(function(img) {
                        var div = document.createElement('div');
                        div.className = 'cursor-pointer border-2 rounded overflow-hidden transition';
                        div.dataset.id = img.id;
                        div.dataset.url = img.url;
                        div.dataset.name = img.name || '';
                        div.classList.add(selectedId == img.id ? 'border-indigo-500' : 'border-transparent');
                        div.innerHTML =
                            '<img src="' + img.url + '" class="w-full h-24 object-cover">' +
                            '<p class="text-xs text-gray-600 px-1 py-1 truncate">' + (img.name || '') + '</p>';
                        div.addEventListener('click', function() {
                            grid.querySelectorAll('[data-id]').forEach(function(el) {
                                el.classList.remove('border-indigo-500');
                                el.classList.add('border-transparent');
                            });
                            div.classList.add('border-indigo-500');
                            div.classList.remove('border-transparent');
                            selectedId = img.id;
                            selectedPath = img.url;
                        });
                        grid.appendChild(div);
                    });
                    grid.classList.remove('hidden');
                    grid.style.display = 'grid';
                    imagesLoaded = true;
                })
                .catch(function() {
                    loadingMsg.textContent = 'Failed to load images.';
                });
        }

        function applySelection() {
            if (!selectedId) {
                closeModal();
                return;
            }
            inputId.value = selectedId;
            inputPath.value = selectedPath;
            previewImg.src = selectedPath;
            previewWrap.classList.remove('hidden');
            clearBtn.classList.remove('hidden');
            btnLabel.textContent = 'Change Image';
            closeModal();
        }

        function clearImage() {
            selectedId = selectedPath = '';
            inputId.value = inputPath.value = '';
            previewWrap.classList.add('hidden');
            clearBtn.classList.add('hidden');
            btnLabel.textContent = 'Pick from Media Library';
            if (grid) grid.querySelectorAll('[data-id]').forEach(function(el) {
                el.classList.remove('border-indigo-500');
                el.classList.add('border-transparent');
            });
        }

        if (openBtn) openBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (doneBtn) doneBtn.addEventListener('click', applySelection);
        if (clearBtn) clearBtn.addEventListener('click', clearImage);
        if (modal) modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
        });

        function setupScopePills() {
            var scopeGroup = document.getElementById('att-scope-group');
            var groupSelect = document.getElementById('att-group-select');
            if (!scopeGroup) return;
            scopeGroup.addEventListener('change', function(e) {
                if (e.target.type !== 'radio') return;
                var on = e.target.value === 'group';
                if (groupSelect) groupSelect.classList.toggle('hidden', !on);
                scopeGroup.querySelectorAll('label.att-scope-pill').forEach(function(lbl) {
                    var sel = lbl.querySelector('input[type=radio]') === e.target;
                    lbl.classList.toggle('border-blue-600', sel);
                    lbl.classList.toggle('bg-blue-50', sel);
                    lbl.classList.toggle('border-gray-200', !sel);
                    lbl.classList.toggle('bg-white', !sel);
                    lbl.classList.toggle('hover:border-blue-300', !sel);
                    lbl.classList.toggle('hover:bg-blue-50', !sel);
                    var icon = lbl.querySelector('i.fas');
                    if (icon) {
                        icon.classList.toggle('text-blue-500', sel);
                        icon.classList.toggle('text-gray-400', !sel);
                    }
                    var span = lbl.querySelector('span');
                    if (span) {
                        span.classList.toggle('text-blue-700', sel);
                        span.classList.toggle('text-gray-700', !sel);
                    }
                });
            });
        }
        setupScopePills();
    })();
</script>
@endpush