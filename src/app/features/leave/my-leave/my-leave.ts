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
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';

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
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucideRefreshCcw,
      lucideCircleCheck,
      lucideCircleX,
      lucideLoader,
      lucideTrash,
    }),
  ],
  templateUrl: './my-leave.html',
})
export class MyLeave {}
