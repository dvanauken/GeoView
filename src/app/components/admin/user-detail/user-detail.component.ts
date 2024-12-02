// src/app/admin/users/user-detail/user-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {
  userId: number;
  user: any = {
    username: '',
    firstName: '',
    middleInitial: '',
    lastName: '',
    status: 'silver'
  };
  statuses = ['gold', 'platinum', 'silver'];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    // In real app, fetch user data here
    // For now, simulate data
    this.user = {
      id: this.userId,
      username: 'jsmith',
      firstName: 'John',
      middleInitial: 'A',
      lastName: 'Smith',
      status: 'gold',
      createDate: new Date('2024-01-15'),
      updateDate: new Date('2024-02-20'),
      createdBy: 'admin',
      updatedBy: 'admin'
    };
  }

  onSubmit(): void {
    // Save logic would go here
    console.log('Saving user:', this.user);
    this.router.navigate(['/admin/users']);
  }

  onCancel(): void {
    this.router.navigate(['/admin/users']);
  }
}