// src/app/admin/users/users.component.ts
import { Component, OnInit } from '@angular/core';

interface User {
  id: number;
  username: string;
  firstName: string;
  middleInitial: string;
  lastName: string;
  status: 'gold' | 'platinum' | 'silver';
  createDate: Date;
  updateDate: Date;
  createdBy: string;
  updatedBy: string;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [
    {
      id: 1,
      username: 'jsmith',
      firstName: 'John',
      middleInitial: 'A',
      lastName: 'Smith',
      status: 'gold',
      createDate: new Date('2024-01-15'),
      updateDate: new Date('2024-02-20'),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: 2,
      username: 'mjohnson',
      firstName: 'Mary',
      middleInitial: 'E',
      lastName: 'Johnson',
      status: 'platinum',
      createDate: new Date('2024-01-20'),
      updateDate: new Date('2024-02-25'),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: 3,
      username: 'rwilson',
      firstName: 'Robert',
      middleInitial: 'J',
      lastName: 'Wilson',
      status: 'silver',
      createDate: new Date('2024-02-01'),
      updateDate: new Date('2024-02-28'),
      createdBy: 'admin',
      updatedBy: 'admin'
    }
  ];

  displayedColumns: string[] = [
    'username',
    'firstName',
    'middleInitial',
    'lastName',
    'status',
    'createDate',
    'updateDate',
    'createdBy',
    'updatedBy'
  ];

  constructor() {}

  ngOnInit(): void {}

  getStatusColor(status: string): string {
    switch (status) {
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      case 'silver': return '#C0C0C0';
      default: return '#FFFFFF';
    }
  }
}