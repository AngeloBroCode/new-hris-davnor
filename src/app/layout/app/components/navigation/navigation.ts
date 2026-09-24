import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '@core/auth/auth-service';
import { DirectionalityService } from '@core/config/directionality-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAward,
  lucideBookOpen,
  lucideBot,
  lucideChevronRight,
  lucideClipboardCheck,
  lucideClipboardList,
  lucideClock,
  lucideDoorOpen,
  lucideFileText,
  lucideGraduationCap,
  lucideLayoutDashboard,
  lucideNotebookPen,
  lucidePalmtree,
  lucideSettings,
  lucideTarget,
  lucideUsers,
} from '@ng-icons/lucide';
import { HlmCollapsibleImports } from '@spartan-ng/helm/collapsible';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmSidebarImports, HlmSidebarService } from '@spartan-ng/helm/sidebar';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { NavGroup } from '../../model/navigation';
import { NavSecondary } from '../secondary/nav-secondary';
import { NavUser } from '../user/user';

@Component({
  selector: 'adm-navigation',
  imports: [
    HlmSidebarImports,
    HlmCollapsibleImports,
    HlmTooltipImports,
    HlmDropdownMenuImports,
    NgIcon,
    NavUser,
    NavSecondary,
    RouterLink,
    RouterModule,
    NgOptimizedImage,
    TranslocoModule,
  ],
  templateUrl: './navigation.html',
  providers: [
    provideIcons({
      lucideLayoutDashboard,
      lucideChevronRight,
      lucideClipboardList,
      lucideClock,
      lucideFileText,
      lucideDoorOpen,
      lucidePalmtree,
      lucideTarget,
      lucideClipboardCheck,
      lucideNotebookPen,
      lucideBookOpen,
      lucideAward,
      lucideUsers,
      lucideGraduationCap,
      lucideSettings,
      lucideBot,
    }),
  ],
})
export class Navigation {
  // ==========================================
  // Services
  // ==========================================

  private readonly _dir = inject(DirectionalityService);
  private readonly _authService = inject(AuthService);
  private readonly _sidebarService = inject(HlmSidebarService);

  // ==========================================
  // State
  // ==========================================

  protected readonly side = computed<'left' | 'right'>(() => (this._dir.isRtl() ? 'right' : 'left'));
  protected readonly sideBarCollapsed = computed(
    () => this._sidebarService.state() === 'collapsed' && !this._sidebarService.isMobile()
  );

  protected readonly _navigationGroups: NavGroup[] = [
    {
      items: [
        { title: 'Dashboard', key: 'dashboard', url: '/dashboard', icon: 'lucideLayoutDashboard' },
      ],
    },
    {
      label: 'attendancePages',
      items: [
        {
          title: 'DTR',
          key: 'dtr',
          icon: 'lucideClipboardList',
          children: [
            { title: 'Justification', key: 'justification', url: '/justification' },
          ],
        },
        { title: 'Daily Time Record', key: 'dailyTimeRecord', url: '/daily-time-record', icon: 'lucideClock' },
        { title: 'Pass Slip', key: 'passSlip', url: '/pass-slip', icon: 'lucideFileText' },
        { title: 'PTLOS', key: 'ptlos', url: '/permission-to-leave-official-station', icon: 'lucideDoorOpen' },
        {
          title: 'Leave',
          key: 'leave',
          icon: 'lucidePalmtree',
          children: [
            { title: 'My Leave', key: 'myLeave', url: '/my-leave' },
            { title: 'Application', key: 'leaveApplication', url: '/leave-application' },
            { title: 'Ledger', key: 'ledger', url: '/ledger' },
          ],
        },
      ],
    },
    {
      label: 'performanceMgmt',
      items: [
        {
          title: 'Major Final Output',
          key: 'majorFinalOutput',
          icon: 'lucideTarget',
          children: [
            { title: 'Office', key: 'mfoOffice', url: '/mfo/office' },
          ],
        },
        {
          title: 'OPCR',
          key: 'opcr',
          icon: 'lucideClipboardCheck',
          children: [
            { title: 'Target', key: 'opcrTarget', url: '/opcr/target' },
            { title: 'Actual', key: 'opcrActual', url: '/opcr/actual' },
          ],
        },
        {
          title: 'DPCR',
          key: 'dpcr',
          icon: 'lucideNotebookPen',
          children: [
            { title: 'Target', key: 'dpcrTarget', url: '/dpcr/target' },
            { title: 'Actual', key: 'dpcrActual', url: '/dpcr/actual' },
          ],
        },
        {
          title: 'IPCR',
          key: 'ipcr',
          icon: 'lucideBookOpen',
          children: [
            { title: 'Target', key: 'ipcrTarget', url: '/ipcr/target' },
            { title: 'Actual', key: 'ipcrActual', url: '/ipcr/actual' },
          ],
        },
      ],
    },
    {
      label: 'hrPages',
      items: [
        {
          title: 'RNR',
          key: 'rnr',
          icon: 'lucideAward',
          children: [
            { title: 'Nominee', key: 'rnrNominee', url: '/rnr/nominee' },
            { title: 'Approving', key: 'rnrApproving', url: '/rnr/approving' },
          ],
        },
        {
          title: 'LND',
          key: 'lnd',
          icon: 'lucideGraduationCap',
          children: [
            { title: 'Competency', key: 'lndCompetency', url: '/lnd/competency' },
          ],
        },
      ],
    },
    {
      label: 'other',
      items: [
        { title: 'settings', key: 'settings', url: '/settings', icon: 'lucideSettings' },
        { title: 'aiAssistant', key: 'aiAssistant', url: '/assistant', icon: 'lucideBot' },
      ],
    },
  ];

  protected readonly user = this._authService.currentUser;
}

