/*
* p2csv - Export all SharePoint sites and lists permissions using jQuery and SPServices
* Version 0.2.2
* @requires jQuery v1.8+ and SPServices library
*
* Copyright (c) 2013 TarcisioGambin.net
* Examples and docs at:
* http://p2csv.codeplex.com
* Licensed under the MIT license:
* http://www.opensource.org/licenses/mit-license.php
*/
/**
 * @description Export all SharePoint sites and lists permissions using jQuery and SPServices
 * @type jQuery
 * @name p2csv
 * @category Plugins/p2csv
 * @author TarcisioGambin.net /tarcisio@learnpoint.net
 */
 
	$(document).ready(function(){

		// checking if the current user has enough rights to use p2csv (enumPermissions)
		// verificando se o usuario atual possui os direitos suficientes para utilizar o p2csvc (enumPermissions)
		var leastPermission = 4611686018427387904; // related to "Enumerate Permissions"
		$().SPServices({
			operation: "GetRolesAndPermissionsForCurrentUser",
			async: false,
			completefunc: function (xData, Status) {
				$(xData.responseXML).find("Permissions").each(function () {
					if(!($(this).attr('Value') >= leastPermission )){
						$('#p2csvSite,#p2csvList').remove();
						$.fn.p2csv = function(){ alert("You don't have enough permissions to do use p2csv. Please ask your SharePoint Administrator!")};
						return false;
					}
				});
			}
			
		});	
	
		// creating the new items for SharePoint site actions menu
		// criando os novos itens para o menu Ações do Site no SharePoint
		var textSite = "Export Site Permissions";
		var descriptionSite = "Click here to export this site permissions in a CSV file!";
		var textList = "Export List Permissions";
		var descriptionList = "Click here to export this list  permissions in a CSV file separated by comma (,)!";
		var checkIsList = $().SPServices.SPListNameFromUrl();
		var menu = $('menu[id$="SiteActionsMenuMain"]');
	
		menu.append('<ie:menuitem type="option" id="p2csvSite" iconsrc="/_layouts/images/settingsIcon.png" onmenuclick="javascript:$().p2csv();return false" text="'+textSite+'" description="'+descriptionSite+'" menugroupid="900"></ie:menuitem>');
			if(checkIsList){
				menu.append('<ie:menuitem type="option" id="p2csvList" iconsrc="/_layouts/images/settingsIcon.png" onmenuclick="javascript:$().p2csv({scope:\'list\'});return false" text="'+textList+'" description="'+descriptionList+'" menugroupid="900"></ie:menuitem>');
			}
	
	});
	 
	(function($) {

	 	$.fn.p2csv = function(options) {

		// base escope configuration
		// configuracao base de escopo
		var config = {
			scope : '',
			separator : ',',
		};
		$.extend(true, config, options);		
		
		// global var definition
		// definicao de variaveis globais
		var permissionsMask = [];
		var siteName;
		var listName;

		function startModal(){
			// modal configuration
			// configuracao do modal
			var messageLayout ='<div id="p2csvBoxes">\
									<div id="p2csvDialog" class="p2csvWindow">\
										<a href="#" class="p2csvClose">Close [X]</a><br />\
										<b>Exporting permissions</b>\
										<p class="p2csvMessage">Loading...</p>\
									</div>\
									<div id="p2csvMask"></div>\
								</div>';			
			$('body').append(messageLayout);

			// CSS configuration
			// configuracao do CSS
			var winH = $(document).height();
			var winW = $(document).width();
			var box = $('#p2csvDialog');
			$('#p2csvMask').css({'position':'absolute','z-index':'999','background-color':'#000','display':'none'});
			$('#p2csvBoxes .p2csvWindow').css({'position':'absolute','width':'440px','height':'100px','display':'none','z-index':'9999','padding':'20px'});
			$('#p2csvBoxes #p2csvDialog').css({'width':'375px','height':'100px','background-color':'#FFF'});
			$('.p2csvClose').css({'display':'block','text-align':'right'});
			$('.p2csvClose a:visited').css({'text-decoration':'none','background-color':'#0072BC'});

			// modal presentation
			// apresentacao do modal
			$(box).css('top',  winH/2-$(box).height()/2);
			$(box).css('left',  winW/2-$(box).width()/2);
			$('#p2csvMask').css({'width':'100%','height':'100%','top':'0','left':'0'});
			$('#p2csvMask').fadeIn(1000);
			$('#p2csvMask').fadeTo("slow",0.8);
			$(box).fadeIn(2000);			
		}
		
		// definicao de mascaras x permissoes
		// masks and permissions definition
		$().SPServices({
			operation: "SiteDataGetWeb",
			async:false,
			completefunc: function (xData, Status){
				var xml = $(xData.responseXML).SPFilterNode('Permissions').text(),
				xmlDoc = $.parseXML(xml),
				$xml = $(xmlDoc);
				$xml.SPFilterNode('Permission').each(function(){
					permissionsMask.push({'mask':parseInt($(this).attr('Mask')),'name':$(this).attr('RoleName')});
				});
			}
		});

		// verifica se a funcao iniciou no escopo do site ou lista
		// check if the function was started on 'list' or 'web' scope
		$().SPServices({
			operation : 'GetWeb',
			webURL : $().SPServices.SPGetCurrentSite(),
			async : false,
			completefunc : function(xData, Status) {
				$(xData.responseXML).find('Web').each(function() {
					siteName = $(this).attr('Title');
				});
			}
		});
		var myObjectName = $().SPServices.SPGetCurrentSite();
		var myObjectType = 'Web';
		var csvFilename = siteName; 

		if (config.scope == 'list') {
			$().SPServices({
				operation : 'GetList',
				listName : $().SPServices.SPListNameFromUrl(),
				async : false,
				completefunc : function(xData, Status) {
					$(xData.responseXML).find('List').each(function() {
						listName = $(this).attr('Title');
					});
				}
			});
			myObjectName = listName;
			myObjectType = 'List';
			csvFilename += ' - ' + listName;
		}
							
		// obtem permissoes via web services relacionadas ao escopo
		// get permissions from web services related to scope
		if (myObjectName) {
			$().SPServices({
				operation : "GetPermissionCollection",
				objectName : myObjectName,
				objectType : myObjectType,
				completefunc : function(xData, Status) {
					var valuableData = 'User Name'+config.separator+'User Login'+config.separator+'User or Group Member?'+config.separator+'Permission'+config.separator+'Permission Mask; \n';
					$(xData.responseXML).find('Permission').each(function() {
						valuableData += formataValores($(this));
					});
					downloadFile(valuableData);
				}
			});
		} else {
			alert("Oooops!\nIt's not possible to get list permissions.\nMake sure you are browsing a list URL! ");
		}

		// formata os valores para um padrao compativel com CSV
		// format the values in compatible CSV standard
		function formataValores(value) {
			var accountLogin;
			var accountType;
			var accountMask;
			var accountName;
			if (value.attr('MemberIsUser') === 'True') {
				accountLogin = value.attr('UserLogin');
				accountType = "User";
				accountMask = value.attr('Mask');
				$().SPServices({
					operation : "GetUserInfo",
					userLoginName : $.trim(accountLogin),
					async : false,
					completefunc : function(xData, Status) {
						$(xData.responseXML).find("User").each(function() {
							accountName = $(this).attr("Name");
						});
					}
				});
				return formatPermissions(accountName, accountLogin, accountType, accountMask);
			} else {
				var groupName = value.attr("GroupName");
				var valoresGrupo = '';
				accountType = groupName;
				accountMask = value.attr('Mask');
				
				$().SPServices({
					operation : "GetUserCollectionFromGroup",
					groupName : groupName,
					async : false,
					completefunc : function(xData, Status) {
						$(xData.responseXML).find("User").each(function() {
							accountName = $(this).attr("Name");
							accountLogin = $(this).attr("LoginName");
							valoresGrupo += formatPermissions(accountName, accountLogin, accountType, accountMask);
						});
					}
				});
				return valoresGrupo;
			}

			// formata as permissoes conforme valores das mascaras pre-definidas anteriormente
			// format the permissions strings according to previously predefined values from masks
			function formatPermissions(name, login, dataType, mask) {
				var permissionAccount;
				// permissionAccount = permissionsMask.filter(function (permission) { return permission.mask == mask })[0].name;
				if (checkIfExists()) {
					return name + config.separator + login + config.separator + dataType + config.separator + permissionAccount + config.separator + mask + "\n";
				} else {
					return name + config.separator + login + config.separator + dataType + config.separator + '**permission not configured**' + config.separator + mask + "\n";
				}

				function checkIfExists() {
					for ( i = 0; i < permissionsMask.length; i++) {
						if (permissionsMask[i].mask == mask) {
							permissionAccount = permissionsMask[i].name;
							return true;
						}
					}
				} 
			}
		}

			// funcao para exportacao de dados e criacao do arquivo CSV 'on the fly'
			// function to export data and create CSV file 'on the fly'
			function downloadFile(data) {
			var mimeType = 'text/csv';
			var blob = new Blob([data], {type: mimeType});
			var filename = 'Permissions of ' + csvFilename + ".csv";
			window.saveAs = window.saveAs || window.webkitSaveAs || window.mozSaveAs || window.msSaveAs;
			navigator.saveBlob = navigator.saveBlob || navigator.msSaveBlob || navigator.mozSaveBlob || navigator.webkitSaveBlob || window.navigator.msSaveBlob;
	
				if (window.saveAs) {
					window.saveAs(blob, filename);
				} else if (navigator.saveBlob){
					navigator.saveBlob(blob, filename);
				} else {
					startModal();
					var link = document.createElement('a');
					link.download = filename;
					link.href = window.URL.createObjectURL(blob);
					link.textContent = 'Click here to download the ' + link.download;
					$('.p2csvMessage').html(link);
					$('.p2csvWindow .p2csvClose, #p2csvMask').click(function(){
						$('#p2csvMask, .p2csvWindow').fadeOut();
					});
				}
			};
		};
	})
(jQuery);