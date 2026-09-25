import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucideRefreshCcw,
  lucideCircleCheck,
  lucideCircleX,
  lucideLoader,
  lucideTrash,
  lucideChevronLeft,
  lucideChevronRight,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';

@Component({
  selector: 'adm-my-leave',
  standalone: true,
  imports: [
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    BrnAlertDialogImports,
    HlmAlertDialogImports,
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucideRefreshCcw,
      lucideCircleCheck,
      lucideCircleX,
      lucideLoader,
      lucideTrash,
      lucideChevronLeft,
      lucideChevronRight,
    }),
  ],
  templateUrl: './my-leave.html',
})
export class MyLeave {
  // Pagination state (mocked)
  currentPage = 1;
  totalPages = 5;

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  deleteRecord(ctx?: { close: () => void }) {
    // Implement delete logic here
    console.log('Record deleted successfully');
    
    // Close the dialog if context is provided
    if (ctx) {
      ctx.close();
    }
  }
}
