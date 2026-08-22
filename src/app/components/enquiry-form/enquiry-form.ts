import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Product } from '../../models/product.model';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-enquiry-form',
  standalone: true,
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './enquiry-form.html',
  styleUrl: './enquiry-form.css',
})
export class EnquiryForm {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  product = input.required<Product>();

  closed = output<void>();
  submitted = signal(false);
  saving = signal(false);
  failed = signal(false);

  readonly form = this.fb.nonNullable.group({
    customerName: ['', Validators.required],
    phone: ['', Validators.required],
    notes: [''],
  });

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.saving.set(true);
    this.failed.set(false);

    this.api
      .createLead({
        customerName: value.customerName.trim(),
        phone: value.phone.trim(),
        productId: this.product().id,
        notes: value.notes.trim(),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.submitted.set(true);
          setTimeout(() => this.closed.emit(), 1100);
        },
        error: () => {
          this.saving.set(false);
          this.failed.set(true);
        },
      });
  }

  onClose(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
