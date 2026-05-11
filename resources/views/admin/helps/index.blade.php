@extends('layouts.admin.layout')

@section('content')
<div class="w-full">
    <div class="flex items-center justify-between mb-4">
        <h1 class="admin-h1">Help Requests</h1>
        <a href="{{ url('/admin/help/create') }}" class="custom-green text-white px-4 py-1 rounded text-sm flex items-center gap-1">
            <img src="{{ url('uploads/icons/plus.svg') }}" class="w-3 h-3 inline"> Add
        </a>
    </div>

    @include('partials.message')

    {{-- Status Tabs --}}
    <ul class="list-reset flex text-xs profile-tab flex-wrap mb-4">
        @foreach(['pending' => 'Pending', 'approve' => 'Approved', 'reject' => 'Rejected', 'close' => 'Closed'] as $tab => $label)
        <li class="px-2 mx-1 py-1 {{ $status === $tab ? 'active' : '' }}">
            <a href="{{ url('/admin/helps') }}?tab={{ $tab }}" class="text-gray-700 font-medium">
                {{ $label }}
                @if(($counts[$tab] ?? 0) > 0)
                    <span class="bg-gray-200 text-gray-700 rounded-full px-1.5 ml-1">{{ $counts[$tab] }}</span>
                @endif
            </a>
        </li>
        @endforeach
    </ul>

    <div class="bg-white shadow p-4">
        {{-- Search --}}
        <form method="GET" action="{{ url('/admin/helps') }}" class="flex gap-2 mb-4">
            <input type="hidden" name="tab" value="{{ $status }}">
            <input type="text" name="search" value="{{ request('search') }}"
                placeholder="Search title, description or name..."
                class="tw-form-control flex-1">
            <button type="submit" class="bg-indigo-600 text-white px-4 py-1 rounded text-sm">Search</button>
            <a href="{{ url('/admin/helps') }}?tab={{ $status }}" class="bg-gray-100 text-gray-700 px-4 py-1 rounded text-sm flex items-center">Reset</a>
        </form>

        @if($helps->count() > 0)
        <div class="overflow-auto">
            <table class="w-full text-sm">
                <thead class="border-t-2 border-b-2">
                    <tr>
                        <th class="text-left py-2 px-2">Submitted By</th>
                        <th class="text-left py-2 px-2">Title</th>
                        <th class="text-left py-2 px-2">Description</th>
                        <th class="text-left py-2 px-2">Contact</th>
                        <th class="text-left py-2 px-2">Submitted</th>
                        <th class="text-left py-2 px-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($helps as $help)
                    <tr class="border-b">
                        <td class="py-2 px-2">{{ $help->user->FullName ?? $help->user->name ?? '—' }}</td>
                        <td class="py-2 px-2">{{ $help->title }}</td>
                        <td class="py-2 px-2">{{ \Str::limit($help->description, 60) }}</td>
                        <td class="py-2 px-2">{{ $help->contact_details }}</td>
                        <td class="py-2 px-2 whitespace-nowrap">{{ $help->created_at->diffForHumans() }}</td>
                        <td class="py-2 px-2 whitespace-nowrap">
                            <a href="{{ url('/admin/help/show/' . $help->id) }}"
                                class="text-white blue-bg rounded px-2 py-1 text-xs">View</a>
                            @if($help->status === 'pending')
                            <a href="{{ url('/admin/help/edit/' . $help->id) }}"
                                class="text-white custom-green rounded px-2 py-1 text-xs ml-1">Review</a>
                            @endif
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="mt-4">{{ $helps->appends(request()->query())->links() }}</div>
        @else
        <p class="text-center text-gray-500 py-8 text-sm">No {{ $status }} help requests found.</p>
        @endif
    </div>
</div>
@endsection
