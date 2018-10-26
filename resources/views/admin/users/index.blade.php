@extends('layouts.layout')

@section('title')
{{__('Users')}}
@endsection

@section('sidebar')
@include('layouts.sidebar', ['sidebar'=> Menu::get('sidebar_admin')])
@endsection

@section('content')
<div class="container page-content" id="users-listing">
  <h1>{{__('Users')}}</h1>
  <div class="row">
    <div class="col">
      <div class="input-group">
        <div class="input-group-prepend">
          <span class="input-group-text" id="basic-addon1">
            <i class="fas fa-search"></i>
          </span>
        </div>
        <input v-model="filter" class="form-control" placeholder="{{__('Search')}}...">
      </div>

    </div>
    <div class="col-8" align="right">
      <a href="#" @click="show" class="btn btn-action"><i class="fas fa-plus"></i> {{__('User')}}</a>
    </div>
  </div>
  <div class="container-fluid">
    <users-listing ref="listing" :filter="filter" v-on:reload="reload"></users-listing>
  </div>
</div>
@endsection

@section('js')
<script src="{{mix('js/admin/users/index.js')}}"></script>
@endsection
