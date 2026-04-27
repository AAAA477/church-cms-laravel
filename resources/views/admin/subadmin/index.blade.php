@extends('layouts.admin.layout')

@php
    /*
     * Map permission sets to human-readable role labels.
     * Ordered from most specific to most generic so the first match wins.
     */
    $rolePresets = [
        'Full Access'         => '__all__',
        'Preacher'            => ['create-sermons','read-sermons','update-sermons','delete-sermons'],
        'Event Coordinator'   => ['create-events','read-events','update-events','create-gallery','read-gallery','update-gallery'],
        'Finance Officer'     => ['create-funds','read-funds','update-funds','view-funds','read-payments','create-payments','read-reports','view-reports'],
        'Content Manager'     => ['create-bulletins','read-bulletins','view-bulletins','create-quotes','read-quotes','update-quotes','create-gallery','read-gallery','update-gallery','create-files','read-files','view-files'],
        'Prayer Coordinator'    => ['read-prayers','update-prayers'],
        'Support Coordinator'   => ['read-helps','update-helps'],
        'Web Admin'             => ['read-contacts','read-feedbacks','update-feedbacks','read-video-conferences','create-video-conferences','delete-video-conferences'],
        'Email Blaster Manager' => ['manage-email-blaster'],
        'CMS Manager'           => ['manage-cms'],
    ];

    $allPermissionNames = App\Models\Permission::pluck('name')->sort()->values()->toArray();

    function detectRole(array $userPerms, array $presets, array $allPerms): string {
        if (empty($userPerms)) return '';
        sort($userPerms);
        $sortedAll = $allPerms;
        sort($sortedAll);
        if ($userPerms === $sortedAll) return 'Full Access';
        foreach ($presets as $label => $required) {
            if ($required === '__all__') continue;
            sort($required);
            if ($userPerms === $required) return $label;
        }
        return 'Custom';
    }
@endphp

@section('content')
<div class="w-full">

    {{-- Header --}}
    <div class="flex items-center justify-between mb-6">
        <h1 class="admin-h1">Sub Admins <span class="text-gray-400 font-normal text-base">({{ $subadmins->count() }})</span></h1>
        <a href="{{ url('/admin/subadmin/add') }}"
           class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-medium rounded-lg transition">
            <img src="{{ url('uploads/icons/plus.svg') }}" class="w-3 h-3 brightness-0 invert">
            Add Sub Admin
        </a>
    </div>

    @include('partials.message')

    {{-- Search --}}
    <form method="GET" action="{{ url('/admin/subadmins') }}" class="mb-5">
        <div class="flex items-center gap-3 max-w-md">
            <input type="text" name="search" value="{{ $search }}"
                   placeholder="Search by name, email or mobile…"
                   class="tw-form-control w-full">
            <button type="submit"
                    class="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition whitespace-nowrap">
                Search
            </button>
            @if($search)
                <a href="{{ url('/admin/subadmins') }}"
                   class="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg transition">
                    Clear
                </a>
            @endif
        </div>
    </form>

    {{-- Table --}}
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table class="w-full text-sm">
            <thead>
                <tr class="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th class="px-5 py-3 text-left">Sub Admin</th>
                    <th class="px-5 py-3 text-left">Contact</th>
                    <th class="px-5 py-3 text-left">Last Login</th>
                    <th class="px-5 py-3 text-left">Role</th>
                    <th class="px-5 py-3 text-left">Permissions</th>
                    <th class="px-5 py-3 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                @forelse($subadmins as $subadmin)
                    @php
                        $profile   = $subadmin->userprofile;
                        $fullname  = $profile ? trim($profile->firstname . ' ' . $profile->lastname) : $subadmin->name;
                        $avatar    = $profile?->AvatarPath;
                        $userPerms = $subadmin->permissions->pluck('name')->sort()->values()->toArray();
                        $roleLabel = detectRole($userPerms, $rolePresets, $allPermissionNames);
                    @endphp
                    <tr class="hover:bg-gray-50 transition">

                        {{-- Avatar + Name --}}
                        <td class="px-5 py-4">
                            <div class="flex items-center gap-3">
                                @if($avatar)
                                    <img src="{{ $avatar }}" class="w-8 h-8 rounded-full object-cover flex-shrink-0">
                                @else
                                    <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                        <span class="text-indigo-600 text-xs font-semibold">
                                            {{ strtoupper(substr($fullname, 0, 1)) }}
                                        </span>
                                    </div>
                                @endif
                                <div>
                                    <p class="font-medium text-gray-800">{{ $fullname }}</p>
                                    <p class="text-xs text-gray-400">{{ $subadmin->name }}</p>
                                </div>
                            </div>
                        </td>

                        {{-- Contact --}}
                        <td class="px-5 py-4 text-gray-600">
                            @if($subadmin->email)
                                <p class="text-xs">{{ $subadmin->email }}</p>
                            @endif
                            @if($subadmin->mobile_no)
                                <p class="text-xs text-gray-400 mt-0.5">{{ $subadmin->mobile_no }}</p>
                            @endif
                            @if(!$subadmin->email && !$subadmin->mobile_no)
                                <span class="text-gray-300">—</span>
                            @endif
                        </td>

                        {{-- Last Login --}}
                        <td class="px-5 py-4 text-gray-600">
                            @if($subadmin->last_login_at)
                                @php $loginAt = \Carbon\Carbon::parse($subadmin->last_login_at); @endphp
                                <p class="text-xs">{{ $loginAt->format('d M Y') }}</p>
                                <p class="text-xs text-gray-400 mt-0.5">{{ $loginAt->format('h:i A') }}</p>
                            @else
                                <span class="text-gray-300 text-xs">Never</span>
                            @endif
                        </td>

                        {{-- Role label --}}
                        <td class="px-5 py-4">
                            @if($roleLabel === 'Full Access')
                                <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700">
                                    Full Access
                                </span>
                            @elseif($roleLabel === 'Custom')
                                <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                                    Custom
                                </span>
                            @elseif($roleLabel)
                                <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
                                    {{ $roleLabel }}
                                </span>
                            @else
                                <span class="text-gray-300 text-xs">No role</span>
                            @endif
                        </td>

                        {{-- Permission badges --}}
                        <td class="px-5 py-4">
                            @if(count($userPerms))
                                <div class="flex flex-wrap gap-1">
                                    @foreach($userPerms as $perm)
                                        <span class="inline-block px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600 font-mono">
                                            {{ $perm }}
                                        </span>
                                    @endforeach
                                </div>
                            @else
                                <span class="text-gray-300 text-xs">None assigned</span>
                            @endif
                        </td>

                        {{-- Actions --}}
                        <td class="px-5 py-4 text-right">
                            <div class="inline-flex items-center gap-2">
                                <a href="{{ url('/admin/subadmin/edit/' . $subadmin->name) }}"
                                   class="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition">
                                    Edit
                                </a>
                                <a href="{{ url('/admin/subadmin/show/' . $subadmin->name) }}"
                                   class="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 transition">
                                    Permissions
                                </a>
                            </div>
                        </td>

                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="px-5 py-12 text-center text-gray-400 text-sm">
                            @if($search)
                                No sub admins found matching <strong>"{{ $search }}"</strong>.
                            @else
                                No sub admins yet.
                                <a href="{{ url('/admin/subadmin/add') }}" class="text-indigo-600 hover:underline ml-1">Add the first one.</a>
                            @endif
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

</div>
@endsection
