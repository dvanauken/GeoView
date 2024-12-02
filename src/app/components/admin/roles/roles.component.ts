
// src/app/components/admin/roles/roles.component.ts
import { Component, OnInit } from '@angular/core';

interface Role {
  roleId: number;
  roleName: string;
  roleDescription: string;
  createDate: Date;
  updateDate: Date;
  createdBy: string;
  updatedBy: string;
}

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  roles: Role[] = [
    {
      roleId: 1,
      roleName: 'Admin',
      roleDescription: 'Full system access and management capabilities',
      createDate: new Date('2024-01-01'),
      updateDate: new Date('2024-02-15'),
      createdBy: 'system',
      updatedBy: 'admin'
    },
    {
      roleId: 2,
      roleName: 'User Manager',
      roleDescription: 'Can manage user accounts and permissions',
      createDate: new Date('2024-01-01'),
      updateDate: new Date('2024-02-20'),
      createdBy: 'system',
      updatedBy: 'admin'
    },
    {
      roleId: 3,
      roleName: 'Report Viewer',
      roleDescription: 'Can view and download system reports',
      createDate: new Date('2024-01-01'),
      updateDate: new Date('2024-02-25'),
      createdBy: 'system',
      updatedBy: 'admin'
    }
  ];

  displayedColumns: string[] = [
    'roleName',
    'roleDescription',
    'createDate',
    'updateDate',
    'createdBy',
    'updatedBy'
  ];

  constructor() {}

  ngOnInit(): void {}
}