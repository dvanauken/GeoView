
// src/app/components/admin/role-detail/role-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-role-detail',
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.scss']
})
export class RoleDetailComponent implements OnInit {
  roleId: number;
  role: any = {
    roleName: '',
    roleDescription: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.roleId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    // Simulate fetching role data
    this.role = {
      roleId: this.roleId,
      roleName: 'Admin',
      roleDescription: 'Full system access and management capabilities',
      createDate: new Date('2024-01-01'),
      updateDate: new Date('2024-02-15'),
      createdBy: 'system',
      updatedBy: 'admin'
    };
  }

  onSubmit(): void {
    console.log('Saving role:', this.role);
    this.router.navigate(['/admin/roles']);
  }

  onCancel(): void {
    this.router.navigate(['/admin/roles']);
  }
}