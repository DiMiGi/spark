<?php

namespace ProcessMaker\Handlers;

use ProcessMaker\Models\User as EloquentUser;
use Adldap\Models\User as LdapUser;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LdapAttributeHandler
{
    /**
     * Synchronizes ldap attributes to the specified model.
     *
     * @param LdapUser     $ldapUser
     * @param EloquentUser $eloquentUser
     *
     * @return void
     */
    public function handle(LdapUser $ldapUser, EloquentUser $eloquentUser)
    {
        $eloquentUser->firstname = $ldapUser->getFirstName();
        $eloquentUser->lastname = $ldapUser->getLastName();
        $eloquentUser->email = $ldapUser->getUserPrincipalName();
        $eloquentUser->username = $ldapUser->getAccountName();
        $eloquentUser->created_at = Carbon::createFromFormat("YmdHis.0Z",$ldapUser->getCreatedAt());
        $eloquentUser->updated_at = Carbon::createFromFormat("YmdHis.0Z",$ldapUser->getUpdatedAt());
    }
}
